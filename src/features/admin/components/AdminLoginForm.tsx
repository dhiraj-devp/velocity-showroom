"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/features/admin/actions";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, undefined);

  return (
    <form action={action} className="mt-10 flex flex-col gap-5">
      <label className="collection-field">
        <span className="collection-label">Email</span>
        <input
          className="collection-input"
          type="email"
          name="email"
          autoComplete="username"
          required
        />
      </label>
      <label className="collection-field">
        <span className="collection-label">Password</span>
        <input
          className="collection-input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state?.error ? (
        <p className="text-sm text-accent" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="collection-apply" disabled={pending}>
        {pending ? "Signing in…" : "Enter desk"}
      </button>
    </form>
  );
}
