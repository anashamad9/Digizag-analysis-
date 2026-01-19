"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const VALID_USERNAME = "Digizagisthebest";
const VALID_PASSWORD = "SfZRn46$v16X";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();
    if (normalizedUsername === VALID_USERNAME && normalizedPassword === VALID_PASSWORD) {
      setError("");
      if (typeof window !== "undefined") {
        window.localStorage.setItem("digizag-auth", "true");
      }
      router.push("/home");
      return;
    }
    setError("Invalid username or password.");
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
            Login
          </p>
          <h1 className="text-3xl font-[var(--font-display)] tracking-tight md:text-5xl">
            Sign in to Digizag
          </h1>
          <p className="max-w-md text-sm text-[color:var(--ink-muted)] md:text-base">
            Enter your credentials to access the dashboard.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-[32px] border border-[color:var(--stroke)] bg-[color:var(--card)]/80 p-6 shadow-[0_24px_60px_-40px_rgba(27,21,15,0.45)]"
        >
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-normal text-[color:var(--ink-muted)]">
                Username
              </span>
              <input
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--ink)] shadow-sm focus:border-[color:var(--accent)] focus:outline-none"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-normal text-[color:var(--ink-muted)]">
                Password
              </span>
              <input
                type="password"
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--ink)] shadow-sm focus:border-[color:var(--accent)] focus:outline-none"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </label>
            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-600"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
