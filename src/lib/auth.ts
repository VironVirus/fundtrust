import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

import { getEnv } from "@/lib/env";
import type { SessionRole, SessionUser } from "@/lib/types";

const SESSION_COOKIE_NAME = "fundtrust_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSecret() {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

function getHomeRoute(role: SessionRole) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "agent") {
    return "/agent/dashboard";
  }

  return "/customer/dashboard";
}

export async function createSession(session: SessionUser) {
  const cookieStore = await cookies();
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());

    return {
      role: payload.role,
      userId: payload.userId,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      branch: payload.branch,
    } as SessionUser;
  } catch {
    return null;
  }
}

export async function requireSession(role: SessionRole) {
  const session = await getSession();

  if (!session || session.role !== role) {
    if (role === "admin") {
      redirect("/admin/login");
    }

    if (role === "agent") {
      redirect("/agent/login");
    }

    redirect("/customer/login");
  }

  return session;
}

export async function requireAdminSession() {
  return requireSession("admin");
}

export async function requireAgentSession() {
  return requireSession("agent");
}

export async function requireCustomerSession() {
  return requireSession("customer");
}

export async function redirectAuthenticatedUser() {
  const session = await getSession();

  if (session) {
    redirect(getHomeRoute(session.role));
  }
}
