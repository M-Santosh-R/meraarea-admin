import { Prisma } from "@prisma/client";

export class ActionError extends Error {}

/** Converts a caught error into a user-friendly Error to rethrow from a Server Action. */
export function toActionError(error: unknown): Error {
  if (error instanceof ActionError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(", ");
      return new Error(`A record with this ${target ?? "value"} already exists.`);
    }
    if (error.code === "P2025") {
      return new Error("Record not found. It may have already been deleted.");
    }
    if (error.code === "P2003") {
      return new Error(
        "This record is referenced by other data, so the operation can't be completed."
      );
    }
  }

  console.error(error);
  return new Error("Something went wrong. Please try again.");
}
