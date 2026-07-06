"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { Spinner } from "@/components/ui/icons";
import { useFormStatus } from "react-dom";

export default function AdminLoginPage() {
  const [state, action] = useActionState(loginAction, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="font-display text-4xl tracking-[0.3em] text-cream">
            KODE
          </span>
          <p className="mt-1 text-xs uppercase tracking-luxe text-gold-soft">
            Admin Panel
          </p>
        </div>

        <form
          action={action}
          className="mt-8 rounded-2xl bg-cream p-7 shadow-lift"
        >
          <h1 className="font-display text-2xl text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Enter your admin credentials to continue.
          </p>

          <label className="mt-6 block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Username
            </span>
            <input
              name="username"
              required
              autoFocus
              autoComplete="username"
              className="kode-input"
              placeholder="admin"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="kode-input"
              placeholder="••••••••"
            />
          </label>

          {state?.error && (
            <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-ink/90 disabled:opacity-70 cursor-pointer"
    >
      {pending ? (
        <>
          <Spinner className="h-5 w-5" /> Signing in…
        </>
      ) : (
        "Sign in"
      )}
    </button>
  );
}
