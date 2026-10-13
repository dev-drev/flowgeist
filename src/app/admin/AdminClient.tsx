"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ADMIN_SECTIONS,
  ASSET_KINDS,
  EVENT_STATUSES,
  LINK_CATEGORIES,
  type AdminRecord,
  type AdminSection,
  type AssetLink,
  createRecord,
  emptyDraft,
  isSupabaseConfigured,
  listRecords,
  parseAssetLinks,
  recordSubtitle,
  recordTitle,
  removeRecord,
  updateRecord,
} from "@/lib/adminCrm";

type Field = {
  key: string;
  label: string;
  type?: "textarea" | "select" | "url" | "date";
  options?: readonly string[];
};

const FIELDS: Record<AdminSection, Field[]> = {
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
  events: [
    { key: "title", label: "Title" },
    { key: "event_date", label: "Date", type: "date" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    { key: "venue", label: "Venue" },
    { key: "promoter", label: "Promoter" },
    { key: "status", label: "Status", type: "select", options: EVENT_STATUSES },
    { key: "ticket_url", label: "Ticket URL", type: "url" },
    { key: "website", label: "Website", type: "url" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  notes: [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "body", label: "Information", type: "textarea" },
  ],
  links: [
    { key: "title", label: "Name" },
    { key: "url", label: "URL", type: "url" },
    { key: "category", label: "Category", type: "select", options: LINK_CATEGORIES },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  assets: [
    { key: "title", label: "Title" },
    { key: "kind", label: "Type", type: "select", options: ASSET_KINDS },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

function asDraft(section: AdminSection, row: AdminRecord): Record<string, string> {
  const skip = new Set(["id", "createdAt", "updatedAt"]);
  const draft = Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => !skip.has(key))
      .map(([key, value]) => [key, String(value ?? "")])
  );
  if (section === "assets") {
    const links = parseAssetLinks(draft.links || draft.url);
    draft.links = JSON.stringify(links.length ? links : [{ name: "", url: "" }]);
  }
  return draft;
}

function hrefFor(value: string) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes("@") && !value.includes(" ")) return `mailto:${value}`;
  if (value.startsWith("@")) return `https://instagram.com/${value.slice(1)}`;
  if (/^[\w.]+$/.test(value)) return `https://instagram.com/${value}`;
  return value;
}

function errorText(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return "Could not save";
}

type MailDraft = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sending: boolean;
  error: string | null;
};

function blankMail(to = "", name = ""): MailDraft {
  return {
    id: crypto.randomUUID(),
    to,
    subject: name ? `Flowgeist — ${name}` : "",
    body: "",
    sending: false,
    error: null,
  };
}

function namedLinks(row: AdminRecord): AssetLink[] {
  if (!("url" in row)) return [];
  return parseAssetLinks(row.url).filter((link) => link.name || link.url);
}

export default function AdminClient() {
  const router = useRouter();
  const [section, setSection] = useState<AdminSection>("promoters");
  const [rows, setRows] = useState<AdminRecord[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>(emptyDraft("promoters"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mails, setMails] = useState<MailDraft[]>([]);
  const [focusMailId, setFocusMailId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    listRecords(section)
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((error) => {
        if (active) setLoadError(errorText(error));
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

  const assetDraftLinks = useMemo(() => {
    const links = parseAssetLinks(draft.links);
    return links.length ? links : [{ name: "", url: "" }];
  }, [draft.links]);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft(section));
    setFormOpen(true);
  };

  const openEdit = (row: AdminRecord) => {
    setEditingId(row.id);
    setDraft(asDraft(section, row));
    setFormOpen(true);
  };

  const openMail = (to = "", name = "") => {
    const next = blankMail(to, name);
    setFormOpen(false);
    setFocusMailId(to ? null : next.id);
    setMails((current) => [...current, next]);
  };

  const duplicateMail = (source: MailDraft) => {
    const copy: MailDraft = {
      ...source,
      id: crypto.randomUUID(),
      sending: false,
      error: null,
    };
    setFocusMailId(copy.id);
    setMails((current) => {
      const index = current.findIndex((mail) => mail.id === source.id);
      if (index === -1) return [...current, copy];
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const updateMail = (id: string, patch: Partial<MailDraft>) => {
    setMails((current) =>
      current.map((mail) => (mail.id === id ? { ...mail, ...patch } : mail))
    );
  };

  const closeMail = (id: string) => {
    setMails((current) => current.filter((mail) => mail.id !== id));
  };

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2800);
  };

  const sendMail = (event: FormEvent, mail: MailDraft) => {
    event.preventDefault();
    const to = mail.to.trim();
    if (!to) {
      updateMail(mail.id, { error: "Add a recipient." });
      return;
    }
    const params = new URLSearchParams();
    if (mail.subject.trim()) params.set("subject", mail.subject.trim());
    if (mail.body.trim()) params.set("body", mail.body.trim());
    const query = params.toString();
    window.location.href = `mailto:${to}${query ? `?${query}` : ""}`;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateRecord(section, editingId, draft);
        setRows((current) => current.map((row) => (row.id === editingId ? updated : row)));
        flash("Saved");
      } else {
        const created = await createRecord(section, draft);
        setRows((current) => [created, ...current.filter((row) => row.id !== created.id)]);
        flash("Added");
      }
      setFormOpen(false);
    } catch (error) {
      flash(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await removeRecord(section, id);
      setRows((current) => current.filter((row) => row.id !== id));
      if (editingId === id) setFormOpen(false);
      flash("Deleted");
    } catch (error) {
      flash(errorText(error));
    }
  };

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      flash("Copied");
    } catch {
      flash("Copy failed");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const setAssetLinks = (links: AssetLink[]) => {
    setDraft((current) => ({ ...current, links: JSON.stringify(links) }));
  };

  const sectionLabel = ADMIN_SECTIONS.find((item) => item.id === section)?.label ?? "Entry";

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
            <p className="mt-2 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
              {isSupabaseConfigured() ? "Supabase connected" : "Saved in this browser"}
            </p>
          </div>
          <nav className="flex flex-wrap gap-5 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] uppercase">
            <Link href="/" className="text-[#8a8a8a] transition hover:text-white">
              Site
            </Link>
            <Link href="/flowgeist-panel" className="text-[#8a8a8a] transition hover:text-white">
              Panel
            </Link>
            <button type="button" onClick={logout} className="text-[#8a8a8a] transition hover:text-white">
              Log out
            </button>
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
              Add {sectionLabel}
            </button>
          </div>
        </div>

        {message && (
          <p className="mb-6 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[#bababa] uppercase">
            {message}
          </p>
        )}

        {loadError && (
          <p className="mb-6 font-[family-name:var(--font-grotesque)] text-sm text-[#c9a0a0]">{loadError}</p>
        )}

        {mails.length > 0 && (
          <div
            className={`mb-8 grid gap-4 ${mails.length > 1 ? "md:grid-cols-2" : "md:max-w-[380px]"}`}
          >
            {mails.map((mail) => (
              <aside key={mail.id} className="h-fit border border-[#2e2e2e] bg-[#0c0c0c] p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.18em] text-white uppercase">
                    Send mail
                  </h2>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => duplicateMail(mail)}
                      className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#bababa] uppercase hover:text-white"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => closeMail(mail.id)}
                      className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <p className="mb-4 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.14em] text-[#8a8a8a] uppercase">
                  From info@flowgeist.net
                </p>
                {mail.error && (
                  <p className="mb-4 font-[family-name:var(--font-grotesque)] text-sm leading-5 text-[#c4c4c4]">
                    {mail.error}
                  </p>
                )}
                <form onSubmit={(event) => sendMail(event, mail)} className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                      To
                    </span>
                    <input
                      value={mail.to}
                      autoFocus={mail.id === focusMailId}
                      onFocus={(event) => {
                        if (mail.id !== focusMailId) return;
                        event.currentTarget.select();
                        setFocusMailId(null);
                      }}
                      onChange={(event) => updateMail(mail.id, { to: event.target.value })}
                      className="w-full border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                      Subject
                    </span>
                    <input
                      value={mail.subject}
                      onChange={(event) => updateMail(mail.id, { subject: event.target.value })}
                      className="w-full border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                      Message
                    </span>
                    <textarea
                      value={mail.body}
                      onChange={(event) => updateMail(mail.id, { body: event.target.value })}
                      rows={8}
                      className="w-full resize-y border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={mail.sending}
                    className="w-full border border-white bg-white px-4 py-3 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-black uppercase disabled:opacity-50"
                  >
                    Open Outlook
                  </button>
                </form>
              </aside>
            ))}
          </div>
        )}

        <div className={`grid gap-8 ${formOpen ? "lg:grid-cols-[1fr_360px]" : ""}`}>
          <section>
            {loading ? (
              <p className="font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                Loading
              </p>
            ) : filtered.length === 0 ? (
              <div className="border border-[#2e2e2e] px-6 py-16 text-center">
                <p className="font-[family-name:var(--font-alte-haas-bold)] text-xl text-white">Nothing saved yet</p>
                <p className="mt-3 font-[family-name:var(--font-grotesque)] text-sm text-[#8a8a8a]">
                  Add promoters, clubs, events, notes, links, or assets. Each asset link can have a name and a URL.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#2e2e2e] border border-[#2e2e2e]">
                {filtered.map((row) => {
                  const title = recordTitle(section, row);
                  const subtitle = recordSubtitle(section, row);
                  const links = section === "assets" || section === "links" ? namedLinks(row) : [];
                  return (
                    <li
                      key={row.id}
                      className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <h2 className="font-[family-name:var(--font-alte-haas-bold)] text-lg text-white">
                          {"email" in row && row.email ? (
                            <button
                              type="button"
                              onClick={() => openMail(row.email, title)}
                              title="Send mail"
                              className="text-left underline-offset-4 hover:underline"
                            >
                              {title}
                            </button>
                          ) : (
                            <button type="button" onClick={() => openEdit(row)} className="text-left">
                              {title}
                            </button>
                          )}
                        </h2>
                        {subtitle && (
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="mt-1 block text-left font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.14em] text-[#8a8a8a] uppercase"
                          >
                            {subtitle}
                          </button>
                        )}
                        {"email" in row && row.email && (
                          <button
                            type="button"
                            onClick={() => openMail(row.email, title)}
                            title="Send mail"
                            className="mt-2 block text-left font-[family-name:var(--font-grotesque)] text-sm text-[#b0b0b0] underline-offset-4 hover:text-white hover:underline"
                          >
                            {row.email}
                          </button>
                        )}
                        {links.map((link, index) => (
                          <p key={`${row.id}-link-${index}`} className="mt-2 font-[family-name:var(--font-grotesque)] text-sm">
                            {link.name && <span className="text-white">{link.name}</span>}
                            {link.name && link.url ? <span className="text-[#666]"> · </span> : null}
                            {link.url && (
                              <a
                                href={hrefFor(link.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#bababa] underline-offset-2 hover:text-white hover:underline"
                              >
                                {link.url}
                              </a>
                            )}
                          </p>
                        ))}
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
                      </div>
                      <div className="flex flex-wrap gap-3 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] uppercase">
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
                        <button type="button" onClick={() => openEdit(row)} className="text-[#bababa] hover:text-white">
                          Edit
                        </button>
                        <button type="button" onClick={() => onDelete(row.id)} className="text-[#666] hover:text-white">
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

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
                          setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                        rows={5}
                        className="w-full resize-y border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={draft[field.key] ?? field.options?.[0] ?? ""}
                        onChange={(event) =>
                          setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                        className="w-full border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none focus:border-[#bababa]"
                      >
                        {(field.options ?? []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "date" ? "date" : "text"}
                        value={draft[field.key] ?? ""}
                        onChange={(event) =>
                          setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                        placeholder={field.type === "url" ? "https://" : ""}
                        className="w-full border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none placeholder:text-[#555] focus:border-[#bababa]"
                      />
                    )}
                  </label>
                ))}

                {section === "assets" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#8a8a8a] uppercase">
                        Links
                      </span>
                      <button
                        type="button"
                        onClick={() => setAssetLinks([...assetDraftLinks, { name: "", url: "" }])}
                        className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#bababa] uppercase hover:text-white"
                      >
                        Add link
                      </button>
                    </div>
                    {assetDraftLinks.map((link, index) => (
                      <div key={`asset-link-${index}`} className="space-y-2 border border-[#2e2e2e] p-3">
                        <input
                          type="text"
                          value={link.name}
                          placeholder="Name"
                          onChange={(event) => {
                            const next = assetDraftLinks.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: event.target.value } : item
                            );
                            setAssetLinks(next);
                          }}
                          className="w-full border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none placeholder:text-[#555] focus:border-[#bababa]"
                        />
                        <input
                          type="text"
                          value={link.url}
                          placeholder="https://"
                          onChange={(event) => {
                            const next = assetDraftLinks.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, url: event.target.value } : item
                            );
                            setAssetLinks(next);
                          }}
                          className="w-full border border-[#2e2e2e] bg-black px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-white outline-none placeholder:text-[#555] focus:border-[#bababa]"
                        />
                        {assetDraftLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setAssetLinks(assetDraftLinks.filter((_, itemIndex) => itemIndex !== index))}
                            className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[#666] uppercase hover:text-white"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

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
