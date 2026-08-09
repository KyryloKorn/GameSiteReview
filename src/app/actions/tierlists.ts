"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { TierListFormSchema, TierListFormState } from "@/lib/definitions";

export async function saveTierList(
  payload: unknown
): Promise<TierListFormState> {
  const session = await getSession();
  if (!session) {
    return { message: "You must be logged in to create or edit a tier list." };
  }

  const validated = TierListFormSchema.safeParse(payload);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Please check form fields.",
    };
  }

  const { id, title, description, visibility, tiersConfig, items } = validated.data;

  try {
    let tierListId = id;

    if (tierListId) {
      // Ensure existing list belongs to user
      const existing = await prisma.tierList.findUnique({
        where: { id: tierListId },
      });

      if (!existing || existing.userId !== session.userId) {
        return { message: "Tier list not found or permission denied." };
      }

      // Atomic update list & replace items
      await prisma.$transaction([
        prisma.tierList.update({
          where: { id: tierListId },
          data: {
            title,
            description,
            visibility,
            tiersConfig: tiersConfig as any,
          },
        }),
        prisma.tierListItem.deleteMany({
          where: { tierListId },
        }),
        prisma.tierListItem.createMany({
          data: items.map((item) => ({
            tierListId: tierListId!,
            gameIgdbId: item.gameIgdbId,
            tierLabel: item.tierLabel,
            position: item.position,
          })),
        }),
      ]);
    } else {
      // Create new list & items inside transaction
      const newList = await prisma.tierList.create({
        data: {
          userId: session.userId,
          title,
          description,
          visibility,
          tiersConfig: tiersConfig as any,
          items: {
            create: items.map((item) => ({
              gameIgdbId: item.gameIgdbId,
              tierLabel: item.tierLabel,
              position: item.position,
            })),
          },
        },
      });

      tierListId = newList.id;

      // Log activity if public or friends
      if (visibility !== "PRIVATE") {
        await prisma.activity.create({
          data: {
            userId: session.userId,
            type: "TIER_LIST_UPDATED",
            payload: {
              tierListId: newList.id,
              title: newList.title,
            },
          },
        });
      }
    }

    revalidatePath("/dashboard/tier-lists");
    revalidatePath(`/tier-list/${tierListId}`);

    return { tierListId, message: "Tier list saved successfully!" };
  } catch (error) {
    console.error("[Action saveTierList] Error:", error);
    return { message: "Failed to save tier list. Please try again." };
  }
}

export async function deleteTierList(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const id = formData.get("id") as string;
  if (!id) return;

  try {
    const list = await prisma.tierList.findUnique({
      where: { id },
    });

    if (!list || list.userId !== session.userId) return;

    await prisma.tierList.delete({
      where: { id },
    });

    revalidatePath("/dashboard/tier-lists");
  } catch (error) {
    console.error("[Action deleteTierList] Error:", error);
  }
}
