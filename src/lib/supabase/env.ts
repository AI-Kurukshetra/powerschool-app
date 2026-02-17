export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    console.error(`[supabase] Missing required environment variable: ${name}`);
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function readSupabaseEnv(): SupabaseEnv {
  return {
    url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
