import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionPayload } from "@/lib/definitions";

const secretKey = process.env.NEXTAUTH_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_COOKIE = "gsr-session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================================
// Encrypt / Decrypt
// ============================================================

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    username: payload.username,
    expiresAt: payload.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    return null;
  }
}

// ============================================================
// Session CRUD
// ============================================================

export async function createSession(
  userId: string,
  username: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const session = await encrypt({ userId, username, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  return decrypt(session);
}

export async function updateSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await decrypt(session);

  if (!session || !payload) return;

  const expires = new Date(Date.now() + SESSION_DURATION);
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
