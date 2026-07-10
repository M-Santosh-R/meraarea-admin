import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export class ValidationError extends Error {}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be a JSON object.");
  }
  return body as Record<string, unknown>;
}

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return jsonError(error.message, 400);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(", ");
      return jsonError(`A record with this ${target ?? "value"} already exists.`, 409);
    }
    if (error.code === "P2025") {
      return jsonError("Record not found.", 404);
    }
    if (error.code === "P2003") {
      return jsonError(
        "This record is referenced by other data, so the operation can't be completed.",
        409
      );
    }
  }
  console.error(error);
  return jsonError("Unexpected server error.", 500);
}
