import { redirect } from "next/navigation";

import { createActionClient } from "@/lib/supabase/action";

function toErrorParam(message: string): string {
  return encodeURIComponent(message);
}

export async function signOut(): Promise<void> {
  "use server";

  const supabase = createActionClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[auth] signOut failed", error.message);
      redirect(`/login?error=${toErrorParam("Unable to sign out. Try again.")}`);
    }
  } catch (error) {
    console.error("[auth] signOut threw", error);
    redirect(`/login?error=${toErrorParam("Unable to sign out. Try again.")}`);
  }

  redirect("/login");
}
