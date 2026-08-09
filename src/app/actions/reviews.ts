"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ReviewFormSchema, ReviewFormState } from "@/lib/definitions";

// ============================================================
// Create or Update Review
// ============================================================

export async function createOrUpdateReview(
  prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await getSession();
  if (!session) {
    return { message: "You must be logged in to write a review." };
  }

  const rawData = {
    gameIgdbId: formData.get("gameIgdbId"),
    scoreOverall: formData.get("scoreOverall"),
    scoreGameplay: formData.get("scoreGameplay") || null,
    scoreStory: formData.get("scoreStory") || null,
    scoreGraphics: formData.get("scoreGraphics") || null,
    scoreSound: formData.get("scoreSound") || null,
    scoreReplayability: formData.get("scoreReplayability") || null,
    content: formData.get("content") || "",
    visibility: formData.get("visibility") || "PRIVATE",
    containsSpoilers: formData.get("containsSpoilers") === "true",
  };

  const validated = ReviewFormSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  try {
    // Check if user already reviewed this game
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.userId,
        gameIgdbId: data.gameIgdbId,
      },
    });

    if (existingReview) {
      // Update existing review
      await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          scoreOverall: data.scoreOverall,
          scoreGameplay: data.scoreGameplay,
          scoreStory: data.scoreStory,
          scoreGraphics: data.scoreGraphics,
          scoreSound: data.scoreSound,
          scoreReplayability: data.scoreReplayability,
          content: data.content,
          visibility: data.visibility,
          containsSpoilers: data.containsSpoilers,
        },
      });
    } else {
      // Create new review
      const newReview = await prisma.review.create({
        data: {
          userId: session.userId,
          gameIgdbId: data.gameIgdbId,
          scoreOverall: data.scoreOverall,
          scoreGameplay: data.scoreGameplay,
          scoreStory: data.scoreStory,
          scoreGraphics: data.scoreGraphics,
          scoreSound: data.scoreSound,
          scoreReplayability: data.scoreReplayability,
          content: data.content,
          visibility: data.visibility,
          containsSpoilers: data.containsSpoilers,
        },
      });

      // Log activity feed if PUBLIC or FRIENDS
      if (data.visibility !== "PRIVATE") {
        await prisma.activity.create({
          data: {
            userId: session.userId,
            type: "REVIEW_POSTED",
            payload: {
              reviewId: newReview.id,
              gameIgdbId: data.gameIgdbId,
              scoreOverall: data.scoreOverall,
            },
          },
        });
      }
    }

    const gameSlug = formData.get("gameSlug") as string;
    if (gameSlug) {
      revalidatePath(`/games/${gameSlug}`);
    }
    revalidatePath("/dashboard/reviews");

    return { success: true, message: "Review saved successfully!" };
  } catch (error) {
    console.error("[Action createOrUpdateReview] Error:", error);
    return { message: "Failed to save review. Please try again." };
  }
}

// ============================================================
// Delete Review
// ============================================================

export async function deleteReview(formData: FormData): Promise<{ success: boolean; message?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  const reviewId = formData.get("reviewId") as string;
  const gameSlug = formData.get("gameSlug") as string;

  if (!reviewId) {
    return { success: false, message: "Review ID required" };
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== session.userId) {
      return { success: false, message: "Review not found or permission denied" };
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    if (gameSlug) {
      revalidatePath(`/games/${gameSlug}`);
    }
    revalidatePath("/dashboard/reviews");

    return { success: true, message: "Review deleted." };
  } catch (error) {
    console.error("[Action deleteReview] Error:", error);
    return { success: false, message: "Failed to delete review." };
  }
}

// ============================================================
// Reaction (Like / Helpful)
// ============================================================

export async function toggleReviewReaction(
  reviewId: string,
  type: "like" | "helpful"
): Promise<{ success: boolean; count?: number }> {
  const session = await getSession();
  if (!session) {
    return { success: false };
  }

  try {
    const existing = await prisma.reviewReaction.findUnique({
      where: {
        userId_reviewId_type: {
          userId: session.userId,
          reviewId,
          type,
        },
      },
    });

    if (existing) {
      await prisma.reviewReaction.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.reviewReaction.create({
        data: {
          userId: session.userId,
          reviewId,
          type,
        },
      });
    }

    const count = await prisma.reviewReaction.count({
      where: { reviewId, type },
    });

    return { success: true, count };
  } catch (error) {
    console.error("[Action toggleReviewReaction] Error:", error);
    return { success: false };
  }
}
