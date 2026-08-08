"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import {
  SignupFormSchema,
  LoginFormSchema,
  SignupFormState,
  LoginFormState,
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

  // 4. Create session and redirect
  await createSession(user.id, user.username);
  redirect("/dashboard");
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

  // 4. Create session and redirect
  await createSession(user.id, user.username);
  redirect("/dashboard");
}

// ============================================================
// Log Out
// ============================================================

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
