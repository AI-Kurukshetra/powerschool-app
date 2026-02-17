export type CookieOptions = {
  name: string;
  value: string;
  maxAge?: number;
  path?: string;
  expires?: Date;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
} & Record<string, unknown>;

export type CookieWriteOptions = Omit<CookieOptions, "name" | "value">;

export type CookieStore = {
  get: (name: string) => { value: string } | undefined;
  set: (cookie: CookieOptions) => void;
};

export type CookieAdapter = {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: CookieWriteOptions) => void;
  remove: (name: string, options?: CookieWriteOptions) => void;
};

export function createCookieAdapter(cookieStore: CookieStore): CookieAdapter {
  return {
    get(name) {
      return cookieStore.get(name)?.value;
    },
    set(name, value, options) {
      cookieStore.set({ name, value, ...options });
    },
    remove(name, options) {
      cookieStore.set({ name, value: "", maxAge: 0, ...options });
    },
  };
}
