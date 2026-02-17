import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createCookieAdapter, type CookieOptions, type CookieStore } from "./cookies";

type StoredCookie = CookieOptions & { value: string };

function createMemoryCookieStore(): CookieStore & {
  dump: () => Record<string, StoredCookie>;
} {
  const store = new Map<string, StoredCookie>();

  return {
    get(name) {
      const cookie = store.get(name);

      if (!cookie) {
        return undefined;
      }

      return { value: cookie.value };
    },
    set(cookie) {
      store.set(cookie.name, { ...cookie, value: cookie.value ?? "" });
    },
    dump() {
      return Object.fromEntries(store.entries());
    },
  };
}

describe("createCookieAdapter", () => {
  it("reads and writes cookies", () => {
    const cookieStore = createMemoryCookieStore();
    const adapter = createCookieAdapter(cookieStore);

    adapter.set("sb-token", "abc", { path: "/" });

    assert.equal(adapter.get("sb-token"), "abc");

    const dump = cookieStore.dump();
    assert.equal(dump["sb-token"].path, "/");
  });

  it("removes cookies by expiring them", () => {
    const cookieStore = createMemoryCookieStore();
    const adapter = createCookieAdapter(cookieStore);

    adapter.remove("sb-token", { path: "/" });

    const dump = cookieStore.dump();
    assert.equal(dump["sb-token"].value, "");
    assert.equal(dump["sb-token"].maxAge, 0);
    assert.equal(dump["sb-token"].path, "/");
  });
});
