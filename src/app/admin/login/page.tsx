"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-5 text-[#e8e8e8]">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-[#2e2e2e] p-8"
      >
        <p className="mb-2 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.22em] text-[#8a8a8a] uppercase">
          Flowgeist · Berlin
        </p>
        <h1 className="mb-8 font-[family-name:var(--font-alte-haas-bold)] text-3xl text-white">
          Admin
        </h1>
        <label className="mb-6 block">
          <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[#8a8a8a] uppercase">
            Password
          </span>
          <input
            type="password"
            value={pass}
            onChange={(event) => setPass(event.target.value)}
            autoComplete="current-password"
            className="w-full border border-[#2e2e2e] bg-[#111] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
          />
        </label>
        {error && (
          <p className="mb-4 font-[family-name:var(--font-grotesque)] text-sm text-[#c9a0a0]">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full border border-white bg-white px-4 py-2 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-black uppercase transition hover:bg-[#bababa] disabled:opacity-50"
        >
          {submitting ? "…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
