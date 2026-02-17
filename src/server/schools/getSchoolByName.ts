import { createClient } from "@/lib/supabase/server";

type School = {
  id: string;
  name: string;
};

type RawSchool = {
  id?: unknown;
  name?: unknown;
};

type SchoolResult =
  | { data: School; error: null }
  | { data: null; error: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseSchool(input: RawSchool | null): School | null {
  if (!input) {
    return null;
  }

  if (!isNonEmptyString(input.id)) {
    return null;
  }

  if (!isNonEmptyString(input.name)) {
    return null;
  }

  return {
    id: input.id.trim(),
    name: input.name.trim(),
  };
}

export async function getSchoolByName(name: string): Promise<SchoolResult> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("schools")
    .select("id, name")
    .eq("name", name)
    .maybeSingle();

  if (error) {
    console.error("[schools] Failed to load school", error.message);
    return { data: null, error: "Unable to load school." };
  }

  const school = parseSchool(data);

  if (!school) {
    return { data: null, error: "School not found." };
  }

  return { data: school, error: null };
}
