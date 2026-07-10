"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionError, toActionError } from "@/lib/actions/errors";

export async function signIn(email: string, password: string) {
  try {
    if (!email.trim() || !password) {
      throw new ActionError("Email and password are required.");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      throw new ActionError("Invalid email or password.");
    }
  } catch (error) {
    throw toActionError(error);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
