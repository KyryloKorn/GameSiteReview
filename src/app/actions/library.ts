"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { GameStatusValue } from "@/lib/definitions";

export async function setGameStatus(
  gameIgdbId: number,
  status: GameStatusValue,
  gameSlug?: string
): Promise<{ success: boolean; message?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Must be logged in." };
  }

  try {
    const existing = await prisma.gameStatus.findUnique({
      where: {
        userId_gameIgdbId: {
          userId: session.userId,
          gameIgdbId,
        },
      },
    });

    const now = new Date();

    if (existing) {
      // Update status
      await prisma.gameStatus.update({
        where: { id: existing.id },
        data: {
          status,
          startedAt: status === "PLAYING" && !existing.startedAt ? now : existing.startedAt,
          completedAt: status === "COMPLETED" ? now : null,
        },
      });
    } else {
      // Create new status
      await prisma.gameStatus.create({
        data: {
          userId: session.userId,
          gameIgdbId,
          status,
          startedAt: status === "PLAYING" ? now : null,
          completedAt: status === "COMPLETED" ? now : null,
        },
      });
    }

    // Log Activity
    if (status === "PLAYING" || status === "COMPLETED") {
      const activityType = status === "COMPLETED" ? "GAME_COMPLETED" : "GAME_STARTED";
      await prisma.activity.create({
        data: {
          userId: session.userId,
          type: activityType,
          payload: {
            gameIgdbId,
            status,
          },
        },
      });
    }

    if (gameSlug) {
      revalidatePath(`/games/${gameSlug}`);
    }
    revalidatePath("/dashboard/library");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[Action setGameStatus] Error:", error);
    return { success: false, message: "Failed to update status." };
  }
}

export async function removeGameStatus(
  gameIgdbId: number,
  gameSlug?: string
): Promise<{ success: boolean; message?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const existing = await prisma.gameStatus.findUnique({
      where: {
        userId_gameIgdbId: {
          userId: session.userId,
          gameIgdbId,
        },
      },
    });

    if (existing) {
      await prisma.gameStatus.delete({
        where: { id: existing.id },
      });
    }

    if (gameSlug) {
      revalidatePath(`/games/${gameSlug}`);
    }
    revalidatePath("/dashboard/library");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[Action removeGameStatus] Error:", error);
    return { success: false, message: "Failed to remove status." };
  }
}
