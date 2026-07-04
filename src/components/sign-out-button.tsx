"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="mt-2 text-xs font-semibold text-espresso/50 underline underline-offset-4 hover:text-espresso"
    >
      Sign out
    </button>
  );
}
