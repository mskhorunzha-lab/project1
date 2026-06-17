import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { User, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AuthSuccess = { ok: true; user: User };
type AuthFailure = { ok: false; response: NextResponse };

const ADMIN_ROLE: UserRole = "ADMIN";

export async function authorize(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthSuccess | AuthFailure> {
  const user = await resolveCurrentUser(req);

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Требуется авторизация" }, { status: 401 }),
    };
  }

  if (!user.active) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Пользователь отключен" }, { status: 403 }),
    };
  }

  if (user.role !== ADMIN_ROLE && !allowedRoles.includes(user.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Недостаточно прав" }, { status: 403 }),
    };
  }

  return { ok: true, user };
}

async function resolveCurrentUser(req: NextRequest): Promise<User | null> {
  const userId = req.headers.get("x-user-id") ?? req.cookies.get("infra_user_id")?.value;
  if (userId) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  const userEmail =
    req.headers.get("x-user-email") ?? process.env.INFRA_PORTAL_DEFAULT_USER_EMAIL;
  if (userEmail) {
    return prisma.user.findUnique({ where: { email: userEmail } });
  }

  if (process.env.NODE_ENV !== "production") {
    return prisma.user.findFirst({
      where: { active: true, role: { in: ["ADMIN", "MANAGER"] } },
      orderBy: { createdAt: "asc" },
    });
  }

  return null;
}
