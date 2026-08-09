"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { UpdateProfileSchema } from "@/lib/definitions";

// ============================================================
// Send Friend Request
// ============================================================

export async function sendFriendRequest(targetUsername: string): Promise<{ success: boolean; message?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "You must be logged in." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername },
  });

  if (!targetUser) {
    return { success: false, message: "User not found." };
  }

  if (targetUser.id === session.userId) {
    return { success: false, message: "You cannot add yourself as a friend." };
  }

  // Check existing friendship/request
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: session.userId, addresseeId: targetUser.id },
        { requesterId: targetUser.id, addresseeId: session.userId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      return { success: false, message: "You are already friends." };
    }
    if (existing.status === "PENDING") {
      return { success: false, message: "Friend request is already pending." };
    }
  }

  try {
    await prisma.friendship.create({
      data: {
        requesterId: session.userId,
        addresseeId: targetUser.id,
        status: "PENDING",
      },
    });

    revalidatePath("/friends");
    revalidatePath(`/user/${targetUsername}`);

    return { success: true, message: "Friend request sent!" };
  } catch (error) {
    console.error("[Action sendFriendRequest] Error:", error);
    return { success: false, message: "Failed to send friend request." };
  }
}

// ============================================================
// Respond to Friend Request (ACCEPT or DECLINE)
// ============================================================

export async function respondFriendRequest(
  friendshipId: string,
  accept: boolean
): Promise<{ success: boolean; message?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || friendship.addresseeId !== session.userId) {
      return { success: false, message: "Request not found or permission denied." };
    }

    if (accept) {
      await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: "ACCEPTED" },
      });

      // Create activity feed event for both users
      await prisma.activity.create({
        data: {
          userId: session.userId,
          type: "FRIEND_ADDED",
          payload: { friendId: friendship.requesterId },
        },
      });
    } else {
      await prisma.friendship.delete({
        where: { id: friendshipId },
      });
    }

    revalidatePath("/friends");
    revalidatePath("/friends/activity");

    return { success: true, message: accept ? "Friend request accepted!" : "Request declined." };
  } catch (error) {
    console.error("[Action respondFriendRequest] Error:", error);
    return { success: false, message: "Failed to respond to request." };
  }
}

// ============================================================
// Remove Friend
// ============================================================

export async function removeFriend(targetUserId: string): Promise<{ success: boolean; message?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: session.userId, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: session.userId },
        ],
      },
    });

    if (existing) {
      await prisma.friendship.delete({
        where: { id: existing.id },
      });
    }

    revalidatePath("/friends");
    return { success: true, message: "Friend removed." };
  } catch (error) {
    console.error("[Action removeFriend] Error:", error);
    return { success: false, message: "Failed to remove friend." };
  }
}

// ============================================================
// Update Gamer Profile
// ============================================================

export async function updateProfile(
  prevState: any,
  formData: FormData
): Promise<{ success?: boolean; message?: string; errors?: any }> {
  const session = await getSession();
  if (!session) {
    return { message: "Unauthorized." };
  }

  const rawData = {
    displayName: formData.get("displayName") || undefined,
    bio: formData.get("bio") || undefined,
    currentlyPlaying: formData.get("currentlyPlaying") || undefined,
  };

  const validated = UpdateProfileSchema.safeParse(rawData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        displayName: validated.data.displayName || null,
        bio: validated.data.bio || null,
        currentlyPlaying: validated.data.currentlyPlaying || null,
      },
    });

    revalidatePath(`/user/${session.username}`);
    revalidatePath("/dashboard");

    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    console.error("[Action updateProfile] Error:", error);
    return { message: "Failed to update profile." };
  }
}
