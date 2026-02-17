import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createActionClient } from "@/lib/supabase/action";

type SelectSchoolInput = {
  school_id: string;
};

type SelectSchoolResult = { error: string | null };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeInput(input: SelectSchoolInput): SelectSchoolInput {
  return {
    school_id: input.school_id.trim(),
  };
}

function toErrorParam(message: string): string {
  return encodeURIComponent(message);
}

export async function selectSchool(
  input: SelectSchoolInput,
): Promise<SelectSchoolResult> {
  "use server";

  if (!isNonEmptyString(input.school_id)) {
    return { error: "Select a school to continue." };
  }

  const payload = normalizeInput(input);
  const supabase = createActionClient();

  const { data, error } = await supabase
    .from("schools")
    .select("id, name")
    .eq("id", payload.school_id)
    .maybeSingle();

  if (error || !data?.id || !data?.name) {
    console.error("[schools] Invalid school selection", error?.message);
    return { error: "School not found." };
  }

  const cookieStore = cookies();
  cookieStore.set({
    name: "school_id",
    value: data.id,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set({
    name: "school_name",
    value: data.name,
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });

  return { error: null };
}

export async function selectSchoolFromForm(
  formData: FormData,
): Promise<void> {
  "use server";

  const schoolId = formData.get("school_id");

  if (typeof schoolId !== "string") {
    redirect(`/?error=${toErrorParam("Select a school to continue.")}`);
  }

  const result = await selectSchool({ school_id: schoolId });

  if (result.error) {
    redirect(`/?error=${toErrorParam(result.error)}`);
  }

  redirect("/login");
}
