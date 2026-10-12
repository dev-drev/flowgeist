"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ADMIN_SECTIONS,
  ASSET_KINDS,
  type AdminRecord,
  type AdminSection,
  createRecord,
  emptyDraft,
  listRecords,
  recordSubtitle,
  recordTitle,
  removeRecord,
  updateRecord,
} from "@/lib/adminCrm";

const FIELDS: Record<
  AdminSection,
  { key: string; label: string; type?: "textarea" | "select" | "url" }[]
> = {
  promoters: [
    { key: "name", label: "Name" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "instagram", label: "Instagram" },
    { key: "website", label: "Website", type: "url" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  clubs: [
    { key: "name", label: "Name" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    { key: "address", label: "Address" },
    { key: "capacity", label: "Capacity" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "instagram", label: "Instagram" },
    { key: "website", label: "Website", type: "url" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  notes: [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "body", label: "Information", type: "textarea" },
  ],
  assets: [
    { key: "title", label: "Title" },
    { key: "kind", label: "Type", type: "select" },
    { key: "url", label: "Asset link", type: "url" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

function asDraft(row: AdminRecord): Record<string, string> {
  const skip = new Set(["id", "createdAt", "updatedAt"]);
  return Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => !skip.has(key))
      .map(([key, value]) => [key, String(value ?? "")])
  );
}

function hrefFor(value: string) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes("@") && !value.includes(" ")) return `mailto:${value}`;
  if (value.startsWith("@")) return `https://instagram.com/${value.slice(1)}`;
  if (/^[\w.]+$/.test(value)) return `https://instagram.com/${value}`;
  return value;
}

export default function AdminPage() {
  const [section, setSection] = useState<AdminSection>("promoters");
  const [rows, setRows] = useState<AdminRecord[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>(emptyDraft("promoters"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [mailTo, setMailTo] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [mailSending, setMailSending] = useState(false);
  const [mailConfigured, setMailConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/email")
      .then((response) => response.json())
      .then((data) => setMailConfigured(Boolean(data.configured)))
      .catch(() => setMailConfigured(false));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listRecords(section)
      .then((data) => {
        if (active) setRows(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [section]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(q))
    );
  }, [query, rows]);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft(section));
    setMailOpen(false);
    setFormOpen(true);
  };

  const openEdit = (row: AdminRecord) => {
    setEditingId(row.id);
    setDraft(asDraft(row));
    setMailOpen(false);
    setFormOpen(true);
  };

  const openMail = (to = "", name = "") => {
    setFormOpen(false);
    setMailTo(to);
    setMailSubject(name ? `Flowgeist — ${name}` : "");
    setMailBody("");
    setMailOpen(true);
  };

  const sendMail = async (event: FormEvent) => {
    event.preventDefault();
    setMailSending(true);
    try {
      const response = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: mailTo,
          subject: mailSubject,
          body: mailBody,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        flash(data.error || "Send failed");
        return;
      }
      flash("Mail sent from info@flowgeist.net");
      setMailOpen(false);
    } catch {
      flash("Send failed");
    } finally {
      setMailSending(false);
    }
  };

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateRecord(section, editingId, draft);
        setRows((current) =>
          current.map((row) => (row.id === editingId ? updated : row))
        );
        flash("Saved");
      } else {
        const created = await createRecord(section, draft);
        setRows((current) => [created, ...current]);
        flash("Added");
      }
      setFormOpen(false);
    } catch {
      flash("Could not save");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this entry?")) return;
    await removeRecord(section, id);
    setRows((current) => current.filter((row) => row.id !== id));
    if (editingId === id) setFormOpen(false);
    flash("Deleted");
  };

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      flash("Copied");
    } catch {
      flash("Copy failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#e8e8e8]">
      <header className="border-b border-[#2e2e2e]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.22em] text-[#8a8a8a] uppercase">
              Flowgeist · Berlin
            </p>
            <h1 className="font-[family-name:var(--font-alte-haas-bold)] text-3xl tracking-tight text-white md:text-4xl">
              Admin
            </h1>
          </div>
          <nav className="flex flex-wrap gap-5 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] uppercase">
            <Link href="/" className="text-[#8a8a8a] transition hover:text-white">
              Site
            </Link>
            <Link
              href="/flowgeist-panel"
              className="text-[#8a8a8a] transition hover:text-white"
            >
              Panel
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-[#2e2e2e] pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {ADMIN_SECTIONS.map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSection(item.id);
                    setQuery("");
                    setFormOpen(false);
                    setMailOpen(false);
                  }}
                  className={`border px-4 py-2 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] uppercase transition ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-[#2e2e2e] text-[#b0b0b0] hover:border-[#bababa] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="min-w-56 border border-[#2e2e2e] bg-[#111] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none placeholder:text-[#666] focus:border-[#bababa]"
            />
            <button
              type="button"
              onClick={() => openMail()}
              className="border border-[#2e2e2e] px-4 py-2 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[#b0b0b0] uppercase transition hover:border-[#bababa] hover:text-white"
            >
              Compose mail
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="border border-white bg-white px-4 py-2 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-black uppercase transition hover:bg-[#bababa]"
            >
              Add {ADMIN_SECTIONS.find((item) => item.id === section)?.label}
            </button>
          </div>
        </div>

        {message && (
          <p className="mb-6 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[#bababa] uppercase">
            {message}
          </p>
        )}

        {mailConfigured === false && (
          <p className="mb-6 font-[family-name:var(--font-grotesque)] text-sm text-[#8a8a8a]">
            Mail is not connected yet. Add <span className="text-white">RESEND_API_KEY</span> and verify{" "}
            <span className="text-white">flowgeist.net</span> on Resend to send from info@flowgeist.net.
          </p>
        )}

        <div className={`grid gap-8 ${formOpen || mailOpen ? "lg:grid-cols-[1fr_360px]" : ""}`}>
          <section>
            {loading ? (
              <p className="font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                Loading
              </p>
            ) : filtered.length === 0 ? (
              <div className="border border-[#2e2e2e] px-6 py-16 text-center">
                <p className="font-[family-name:var(--font-alte-haas-bold)] text-xl text-white">
                  Nothing saved yet
                </p>
                <p className="mt-3 font-[family-name:var(--font-grotesque)] text-sm text-[#8a8a8a]">
                  Add promoters, clubs, notes or asset links. Everything stays here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#2e2e2e] border border-[#2e2e2e]">
                {filtered.map((row) => {
                  const title = recordTitle(section, row);
                  const subtitle = recordSubtitle(section, row);
                  const assetUrl = "url" in row ? row.url : "";
                  return (
                    <li
                      key={row.id}
                      className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:justify-between"
                    >
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <h2 className="font-[family-name:var(--font-alte-haas-bold)] text-lg text-white">
                          {title}
                        </h2>
                        {subtitle && (
                          <p className="mt-1 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.14em] text-[#8a8a8a] uppercase">
                            {subtitle}
                          </p>
                        )}
                        {"email" in row && row.email && (
                          <p className="mt-2 font-[family-name:var(--font-grotesque)] text-sm text-[#b0b0b0]">
                            {row.email}
                          </p>
                        )}
                        {"notes" in row && row.notes && (
                          <p className="mt-2 line-clamp-2 font-[family-name:var(--font-grotesque)] text-sm text-[#8a8a8a]">
                            {row.notes}
                          </p>
                        )}
                        {"body" in row && row.body && (
                          <p className="mt-2 line-clamp-3 font-[family-name:var(--font-grotesque)] text-sm text-[#8a8a8a]">
                            {row.body}
                          </p>
                        )}
                      </button>
                      <div className="flex flex-wrap gap-3 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] uppercase">
                        {assetUrl && (
                          <>
                            <a
                              href={hrefFor(assetUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#bababa] hover:text-white"
                            >
                              Open
                            </a>
                            <button
                              type="button"
                              onClick={() => copyText(assetUrl)}
                              className="text-[#8a8a8a] hover:text-white"
                            >
                              Copy link
                            </button>
                          </>
                        )}
                        {"email" in row && row.email && (
                          <>
                            <button
                              type="button"
                              onClick={() => openMail(row.email, recordTitle(section, row))}
                              className="text-[#bababa] hover:text-white"
                            >
                              Send
                            </button>
                            <button
                              type="button"
                              onClick={() => copyText(row.email)}
                              className="text-[#8a8a8a] hover:text-white"
                            >
                              Copy mail
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="text-[#bababa] hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(row.id)}
                          className="text-[#666] hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {mailOpen && (
            <aside className="h-fit border border-[#2e2e2e] bg-[#0c0c0c] p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.18em] text-white uppercase">
                  Send mail
                </h2>
                <button
                  type="button"
                  onClick={() => setMailOpen(false)}
                  className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase hover:text-white"
                >
                  Close
                </button>
              </div>
              <p className="mb-4 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.14em] text-[#8a8a8a] uppercase">
                From info@flowgeist.net
              </p>
              <form onSubmit={sendMail} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                    To
                  </span>
                  <input
                    value={mailTo}
                    onChange={(event) => setMailTo(event.target.value)}
                    className="w-full border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                    Subject
                  </span>
                  <input
                    value={mailSubject}
                    onChange={(event) => setMailSubject(event.target.value)}
                    className="w-full border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                    Message
                  </span>
                  <textarea
                    value={mailBody}
                    onChange={(event) => setMailBody(event.target.value)}
                    rows={8}
                    className="w-full resize-y border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                  />
                </label>
                <button
                  type="submit"
                  disabled={mailSending}
                  className="w-full border border-white bg-white px-4 py-3 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-black uppercase disabled:opacity-50"
                >
                  {mailSending ? "Sending" : "Send"}
                </button>
              </form>
            </aside>
          )}

          {formOpen && (
            <aside className="h-fit border border-[#2e2e2e] bg-[#0c0c0c] p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.18em] text-white uppercase">
                  {editingId ? "Edit entry" : "New entry"}
                </h2>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase hover:text-white"
                >
                  Close
                </button>
              </div>
              <form onSubmit={onSubmit} className="space-y-4">
                {FIELDS[section].map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                      {field.label}
                    </span>
                    {field.type === "textarea" ? (
                      <textarea
                        value={draft[field.key] ?? ""}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                        }
                        rows={5}
                        className="w-full resize-y border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={draft[field.key] ?? "other"}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                        }
                        className="w-full border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                      >
                        {ASSET_KINDS.map((kind) => (
                          <option key={kind} value={kind}>
                            {kind}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={draft[field.key] ?? ""}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                        }
                        className="w-full border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                      />
                    )}
                  </label>
                ))}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full border border-white bg-white px-4 py-3 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-black uppercase disabled:opacity-50"
                >
                  {saving ? "Saving" : "Save"}
                </button>
              </form>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
