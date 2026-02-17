import { revalidatePath } from "next/cache";

import { createActionClient } from "@/lib/supabase/action";
import { getViewerContext } from "@/server/auth/getViewerContext";

type MarkFeePaidInput = {
  fee_id: string;
};

type MarkFeePaidResult = { error: string | null };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function markFeePaid(
  input: MarkFeePaidInput,
): Promise<MarkFeePaidResult> {
  "use server";

  if (!isNonEmptyString(input.fee_id)) {
    return { error: "Invalid fee selection." };
  }

  const supabase = createActionClient();
  const viewerResult = await getViewerContext();

  if (viewerResult.error || !viewerResult.data) {
    return { error: viewerResult.error ?? "Not authenticated." };
  }

  const { userId, role } = viewerResult.data;

  if (role !== "parent" && role !== "admin") {
    return { error: "You are not allowed to update fee status." };
  }

  const { data: fee, error: feeError } = await supabase
    .from("fees")
    .select("id, student_id, status")
    .eq("id", input.fee_id)
    .maybeSingle();

  if (feeError || !fee?.id) {
    console.error("[fees] Fee lookup failed", feeError?.message);
    return { error: "Fee record not found." };
  }

  if (fee.status === "paid") {
    return { error: null };
  }

  if (role === "parent") {
    const { data: guardians, error: guardiansError } = await supabase
      .from("guardians")
      .select("student_id")
      .eq("user_id", userId)
      .eq("student_id", fee.student_id)
      .maybeSingle();

    if (guardiansError || !guardians?.student_id) {
      console.warn("[fees] Fee update forbidden for user", { userId });
      return { error: "You are not allowed to update this fee." };
    }
  }

  const { error: updateError } = await supabase
    .from("fees")
    .update({ status: "paid" })
    .eq("id", fee.id);

  if (updateError) {
    console.error("[fees] Failed to update fee", updateError.message);
    return { error: "Unable to update fee status." };
  }

  revalidatePath("/dashboard/fees");

  return { error: null };
}

export async function markFeePaidFromForm(
  formData: FormData,
): Promise<void> {
  "use server";

  const feeId = formData.get("fee_id");

  if (typeof feeId !== "string") {
    console.warn("[fees] Invalid fee selection from form");
    return;
  }

  const result = await markFeePaid({ fee_id: feeId });

  if (result.error) {
    console.warn("[fees] markFeePaid failed", result.error);
  }
}
