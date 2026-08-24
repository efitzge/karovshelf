"use client";

import Image from "next/image";
import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(signIn, null);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-8 px-4 sm:flex-row sm:gap-12">
      <div className="w-full max-w-[280px] shrink-0 rounded-2xl bg-art-surface p-4 sm:max-w-[320px]">
        <Image
          src="/art/login-israel.webp"
          alt=""
          width={1536}
          height={1024}
          className="h-auto w-full object-contain"
          priority
        />
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-background/95 p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold">KarovShelf</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Sign in with the email and PIN you were given.
        </p>
        <form action={formAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            PIN
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              required
              className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
