import { revalidatePath } from "next/cache";

import { createActionClient } from "@/lib/supabase/action";
import { getViewerContext } from "@/server/auth/getViewerContext";

type UpdateProfileInput = {
  full_name: string;
  phone?: string;
  address?: string;
};

type UpdateProfileResult = { error: string | null };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeInput(input: UpdateProfileInput) {
  return {
    full_name: input.full_name.trim(),
    phone: input.phone?.trim() ?? "",
    address: input.address?.trim() ?? "",
  };
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  "use server";

  if (!isNonEmptyString(input.full_name)) {
    return { error: "Name is required." };
  }

  const payload = normalizeInput(input);

  const supabase = createActionClient();
  const viewerResult = await getViewerContext();

  if (viewerResult.error || !viewerResult.data) {
    return { error: viewerResult.error ?? "Not authenticated." };
  }

  const { userId } = viewerResult.data;

  const { error } = await supabase
    .from("users")
    .update({
      full_name: payload.full_name,
      phone: payload.phone,
      address: payload.address,
    })
    .eq("id", userId);

  if (error) {
    console.error("[profile] Failed to update profile", error.message);
    return { error: "Unable to update profile." };
  }

  revalidatePath("/profile");

  return { error: null };
}
