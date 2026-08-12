"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, getSession } from "@/lib/session";
import {
  SignupFormSchema,
  LoginFormSchema,
  SignupFormState,
  LoginFormState,
  UpdateSettingsSchema,
  ForgotPasswordSchema,
} from "@/lib/definitions";

// ============================================================
// Sign Up
// ============================================================

export async function signup(
  state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, email, password } = validatedFields.data;

  // 2. Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return { message: "An account with this email already exists." };
    }
    return { message: "This username is already taken." };
  }

  // 3. Hash password and create user
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      displayName: username,
    },
  });

  if (!user) {
    return { message: "An error occurred while creating your account." };
  }

  // 4. Create session and return redirect payload
  await createSession(user.id, user.username);
  revalidatePath("/", "layout");
  return { success: true, redirectTo: "/dashboard" };
}

// ============================================================
// Log In
// ============================================================

export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  // 2. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { message: "Invalid email or password." };
  }

  // 3. Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return { message: "Invalid email or password." };
  }

  // 4. Create session and return redirect payload
  await createSession(user.id, user.username);
  revalidatePath("/", "layout");
  return { success: true, redirectTo: "/dashboard" };
}

// ============================================================
// Log Out
// ============================================================

export async function logout(): Promise<void> {
  await deleteSession();
  revalidatePath("/", "layout");
  redirect("/login");
}

// ============================================================
// Update Account Settings (Avatar, Email, Password, Profile)
// ============================================================

export async function updateAccountSettings(
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
    avatarUrl: formData.get("avatarUrl") || undefined,
    email: formData.get("email") || undefined,
    currentPassword: formData.get("currentPassword") || undefined,
    newPassword: formData.get("newPassword") || undefined,
  };

  const validated = UpdateSettingsSchema.safeParse(rawData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { message: "User not found." };

  const updateData: any = {};

  // Display Name, Bio, Currently Playing
  if (data.displayName !== undefined) updateData.displayName = data.displayName || null;
  if (data.bio !== undefined) updateData.bio = data.bio || null;
  if (data.currentlyPlaying !== undefined) updateData.currentlyPlaying = data.currentlyPlaying || null;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null;

  // Email update
  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { message: "Email is already taken by another account." };
    }
    updateData.email = data.email;
  }

  // Password update
  if (data.newPassword) {
    if (!data.currentPassword) {
      return { message: "Current password is required to change password." };
    }
    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValid) {
      return { message: "Current password is incorrect." };
    }
    updateData.passwordHash = await bcrypt.hash(data.newPassword, 12);
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    });

    revalidatePath(`/user/${session.username}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { success: true, message: "Account settings updated successfully!" };
  } catch (error) {
    console.error("[Action updateAccountSettings] Error:", error);
    return { message: "Failed to update settings." };
  }
}

// ============================================================
// Forgot Password / Password Reset
// ============================================================

export async function resetPassword(
  prevState: any,
  formData: FormData
): Promise<{ success?: boolean; message?: string; errors?: any }> {
  const rawData = {
    email: formData.get("email"),
    newPassword: formData.get("newPassword"),
  };

  const validated = ForgotPasswordSchema.safeParse(rawData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, newPassword } = validated.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // For security, present standard message or success message
    return { message: "If an account with that email exists, password has been reset." };
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { success: true, message: "Password reset successful! You can now log in with your new password." };
  } catch (error) {
    console.error("[Action resetPassword] Error:", error);
    return { message: "Failed to reset password." };
  }
}
