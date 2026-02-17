import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createActionClient } from "@/lib/supabase/action";

type SignInInput = {
  email: string;
  password: string;
  school_id?: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeInput(input: SignInInput): SignInInput {
  return {
    email: input.email.trim(),
    password: input.password.trim(),
    school_id: input.school_id?.trim(),
  };
}

function isEmailLike(value: string): boolean {
  return value.includes("@") && value.length >= 5;
}

export async function signIn(input: SignInInput): Promise<string | null> {
  "use server";

  if (!isNonEmptyString(input.email) || !isNonEmptyString(input.password)) {
    return "Email and password are required.";
  }

  const payload = normalizeInput(input);

  if (!isEmailLike(payload.email)) {
    return "Enter a valid email address.";
  }

  const supabase = createActionClient();
  const cookieStore = cookies();
  const schoolId =
    (isNonEmptyString(input.school_id) ? input.school_id.trim() : "") ||
    cookieStore.get("school_id")?.value;

  if (!schoolId) {
    return "Select a school before signing in.";
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      console.error("[auth] signIn failed", error.message);
      return "Invalid email or password.";
    }
  } catch (error) {
    console.error("[auth] signIn threw", error);
    return "Something went wrong. Try again.";
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log(userData);

  if (userError || !userData.user) {
    console.error("[auth] Unable to load authenticated user");
    await supabase.auth.signOut();
    return "Unable to validate school access. Try again.";
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[auth] profile lookup failed", profileError.message);
    await supabase.auth.signOut();
    return "Unable to validate school access. Try again.";
  }
  console.log('cc', profile);

  if (!profile?.school_id) {
    console.warn("[auth] user profile missing school_id");
    await supabase.auth.signOut();
    return "Your account is missing a school assignment.";
  }

  if (profile.school_id !== schoolId) {
    console.warn("[auth] school mismatch for user", {
      selectedSchoolId: schoolId,
      profileSchoolId: profile.school_id,
    });
    await supabase.auth.signOut();
    return "This account is not associated with the selected school.";
  }

  revalidatePath("/");

  redirect("/dashboard");
}
