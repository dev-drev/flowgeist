"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
  type Promoter,
  PROMOTER_CSV_COLUMNS,
  createRecord,
  createRecords,
  emptyDraft,
  listRecords,
  parseAssetLinks,
  parsePromoterCsv,
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

function promoterMatches(promoters: Promoter[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return promoters
    .filter((item) => item.email.trim())
    .filter((item) => item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q))
    .slice(0, 12);
}

type InboxItem = {
  id: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  receivedAt: string;
  preview: string;
  isRead: boolean;
};

type InboxDetail = InboxItem & {
  body: string;
  bodyType: "html" | "text";
};

function mailDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const FLOWGEIST_SOCIALS = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/flowgeistx/" },
  { id: "soundcloud", label: "SoundCloud", href: "https://soundcloud.com/flowgeistx" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/flowgeistx" },
  { id: "ra", label: "Resident Advisor", href: "https://ra.co/dj/flowgeist" },
] as const;

function SocialMark({ id }: { id: (typeof FLOWGEIST_SOCIALS)[number]["id"] }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
  };
  if (id === "instagram") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="16" rx="4.5" />
        <circle cx="12" cy="12" r="3.8" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (id === "soundcloud") {
    return (
      <svg {...common}>
        <path d="M4 16h12a3.5 3.5 0 1 0-.6-6.95A5 5 0 0 0 6.6 10" />
        <path d="M5 16V11.8M7 16V10.8M9 16V10.2M11 16v-.6M13 16v-.5M15 16v-.2" />
      </svg>
    );
  }
  if (id === "facebook") {
    return (
      <svg {...common}>
        <path d="M14 8.2V6.7c0-.6.3-.9.9-.9H16V4h-1.6C12.4 4 11.2 5.2 11.2 7v1.2H9.5V11h1.7v7h2.6v-7h2l.3-2.8H13.8" />
      </svg>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center font-[family-name:var(--font-pt-mono)] text-[9px] leading-none tracking-tight">
      RA
    </span>
  );
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
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [suggestMailId, setSuggestMailId] = useState<string | null>(null);
  const [suggestIndex, setSuggestIndex] = useState(0);
  const [focusMailId, setFocusMailId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [inboxReconnect, setInboxReconnect] = useState(false);
  const [mailbox, setMailbox] = useState("info@flowgeist.net");
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [openMessageId, setOpenMessageId] = useState<string | null>(null);
  const [openMessage, setOpenMessage] = useState<InboxDetail | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [light, setLight] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => {
    setLight((current) => !current);
  };

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

  useEffect(() => {
    if (section !== "promoters") return;
    setPromoters(rows as Promoter[]);
  }, [section, rows]);

  useEffect(() => {
    if (section === "promoters") return;
    let active = true;
    listRecords<Promoter>("promoters")
      .then((data) => {
        if (active) setPromoters(data);
      })
      .catch(() => {});
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

  const pickPromoter = (mail: MailDraft, promoter: Promoter) => {
    const generated = mail.subject.startsWith("Flowgeist — ");
    updateMail(mail.id, {
      to: promoter.email,
      subject: !mail.subject.trim() || generated ? `Flowgeist — ${promoter.name}` : mail.subject,
    });
    setSuggestMailId(null);
  };

  const closeMail = (id: string) => {
    setMails((current) => current.filter((mail) => mail.id !== id));
  };

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2800);
  };

  const loadInbox = useCallback(async () => {
    setInboxOpen(true);
    setInboxLoading(true);
    setInboxError(null);
    setInboxReconnect(false);
    try {
      const response = await fetch("/api/admin/email/inbox");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setInbox([]);
        setInboxError(data.error || "Could not read mail");
        setInboxReconnect(Boolean(data.reconnect));
        return;
      }
      setMailbox(data.mailbox || "info@flowgeist.net");
      setInbox(Array.isArray(data.messages) ? data.messages : []);
    } catch {
      setInboxError("Could not read mail");
    } finally {
      setInboxLoading(false);
    }
  }, []);

  const openInboxMessage = async (id: string) => {
    setOpenMessageId(id);
    setOpenMessage(null);
    setMessageLoading(true);
    try {
      const response = await fetch(`/api/admin/email/inbox?id=${encodeURIComponent(id)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setInboxError(data.error || "Could not open this mail");
        setInboxReconnect(Boolean(data.reconnect));
        return;
      }
      setOpenMessage(data as InboxDetail);
    } catch {
      setInboxError("Could not open this mail");
    } finally {
      setMessageLoading(false);
    }
  };

  const replyToInbox = (item: InboxItem) => {
    const subject = /^re:/i.test(item.subject) ? item.subject : `Re: ${item.subject}`;
    const next = blankMail(item.fromEmail);
    next.subject = subject;
    setFocusMailId(null);
    setMails((current) => [...current, next]);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mail = params.get("mail");
    if (!mail) return;
    if (mail === "connected") {
      flash("Outlook connected");
      void loadInbox();
    } else if (mail === "error") {
      setInboxOpen(true);
      setInboxError(params.get("reason") || "Outlook connection failed");
      setInboxReconnect(true);
    }
    params.delete("mail");
    params.delete("reason");
    const next = params.toString();
    window.history.replaceState(null, "", next ? `/admin?${next}` : "/admin");
  }, [loadInbox]);

  const sendMail = async (event: FormEvent, mail: MailDraft) => {
    event.preventDefault();
    updateMail(mail.id, { sending: true, error: null });
    try {
      const response = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: mail.to,
          subject: mail.subject,
          body: mail.body,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        updateMail(mail.id, {
          sending: false,
          error: data.error || "Send failed",
        });
        return;
      }
      flash("Mail sent from info@flowgeist.net");
      closeMail(mail.id);
    } catch {
      updateMail(mail.id, { sending: false, error: "Send failed" });
    }
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

  const downloadPromoterTemplate = () => {
    const csv = `${PROMOTER_CSV_COLUMNS.join(",")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "promoters.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importPromoters = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      flash("Use a .csv file");
      return;
    }

    let parsed: Record<string, string>[];
    try {
      parsed = parsePromoterCsv(await file.text());
    } catch {
      flash("Could not read the CSV");
      return;
    }

    if (parsed.length === 0) {
      flash("No promoters found. Columns: name, city, country, email, phone, instagram, website, notes");
      return;
    }

    const existingEmails = new Set(
      rows.map((row) => ("email" in row ? row.email.trim().toLowerCase() : "")).filter(Boolean)
    );
    const seen = new Set<string>();
    const fresh: Record<string, string>[] = [];
    let skipped = 0;
    for (const item of parsed) {
      const email = item.email.trim().toLowerCase();
      if (email && (existingEmails.has(email) || seen.has(email))) {
        skipped += 1;
        continue;
      }
      if (email) seen.add(email);
      fresh.push(item);
    }

    if (fresh.length === 0) {
      flash(skipped === 1 ? "Already saved" : `Already saved (${skipped})`);
      return;
    }

    const countLabel = fresh.length === 1 ? "1 promoter" : `${fresh.length} promoters`;
    const skipNote = skipped ? ` ${skipped} already saved will be skipped.` : "";
    if (!window.confirm(`Import ${countLabel}?${skipNote}`)) return;

    setImporting(true);
    try {
      const created = await createRecords<Promoter>("promoters", fresh);
      setRows((current) => {
        const ids = new Set(created.map((row) => row.id));
        return [...created, ...current.filter((row) => !ids.has(row.id))];
      });
      flash(skipped ? `Added ${created.length}, skipped ${skipped}` : `Added ${created.length}`);
    } catch (error) {
      flash(errorText(error));
    } finally {
      setImporting(false);
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

  const copyText = async (value: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(value);
      flash(label);
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
    <div
      className="admin-shell min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)]"
      data-theme={light ? "light" : "dark"}
    >
      <div className="mx-auto w-full max-w-[1440px] px-5">
      <header className="border-b border-[var(--admin-border)]">
        <div className="flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="inline-flex shrink-0 items-center">
            <Image
              src={light ? "/signature-logo.png" : "/signature-logo-dark.png"}
              alt="Flowgeist"
              width={280}
              height={64}
              quality={100}
              priority
              className="h-[30px] w-auto md:h-9"
            />
          </Link>
          <nav className="flex flex-wrap items-center gap-5 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] uppercase">
            <Link href="/" className="text-[var(--admin-muted)] transition hover:text-[var(--admin-strong)]">
              Site
            </Link>
            <Link href="/flowgeist-panel" className="text-[var(--admin-muted)] transition hover:text-[var(--admin-strong)]">
              Panel
            </Link>
            <button type="button" onClick={logout} className="text-[var(--admin-muted)] transition hover:text-[var(--admin-strong)]">
              Log out
            </button>
          </nav>
        </div>
      </header>

      <div className="pt-8 pb-24">
        <div className="mb-8 flex flex-col gap-4 border-b border-[var(--admin-border)] pb-6 md:flex-row md:items-center md:justify-between">
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
                      ? "border-[var(--admin-invert)] bg-[var(--admin-invert)] text-[var(--admin-invert-text)]"
                      : "border-[var(--admin-border)] text-[var(--admin-soft)] hover:border-[var(--admin-line)] hover:text-[var(--admin-strong)]"
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
              className="min-w-56 border border-[var(--admin-border)] bg-[var(--admin-field)] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-strong)] outline-none placeholder:text-[var(--admin-faint)] focus:border-[var(--admin-line)]"
            />
            <button
              type="button"
              onClick={() => void loadInbox()}
              className="border border-[var(--admin-border)] px-4 py-2 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[var(--admin-soft)] uppercase transition hover:border-[var(--admin-line)] hover:text-[var(--admin-strong)]"
            >
              Inbox
            </button>
            <button
              type="button"
              onClick={() => openMail()}
              className="border border-[var(--admin-border)] px-4 py-2 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[var(--admin-soft)] uppercase transition hover:border-[var(--admin-line)] hover:text-[var(--admin-strong)]"
            >
              Compose mail
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="border border-[var(--admin-invert)] bg-[var(--admin-invert)] px-4 py-2 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[var(--admin-invert-text)] uppercase transition hover:bg-[var(--admin-invert-hover)]"
            >
              Add {sectionLabel}
            </button>
          </div>
        </div>

        {message && (
          <p className="mb-6 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[var(--admin-soft)] uppercase">
            {message}
          </p>
        )}

        {loadError && (
          <p className="mb-6 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-danger)]">{loadError}</p>
        )}

        {inboxOpen && (
          <section className="mb-8 border border-[var(--admin-border)] bg-[var(--admin-surface)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
              <div>
                <h2 className="font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.18em] text-[var(--admin-strong)] uppercase">
                  Inbox
                </h2>
                <p className="mt-1 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.14em] text-[var(--admin-muted)] uppercase">
                  {mailbox}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => void loadInbox()}
                  className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-soft)] uppercase hover:text-[var(--admin-strong)]"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInboxOpen(false);
                    setOpenMessage(null);
                    setOpenMessageId(null);
                  }}
                  className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-muted)] uppercase hover:text-[var(--admin-strong)]"
                >
                  Close
                </button>
              </div>
            </div>
            {inboxError && (
              <p className="border-b border-[var(--admin-border)] px-5 py-4 font-[family-name:var(--font-grotesque)] text-sm leading-5 text-[var(--admin-note)]">
                {inboxError}{" "}
                {inboxReconnect && (
                  <a href="/api/admin/email/auth" className="text-[var(--admin-strong)] underline-offset-4 hover:underline">
                    Connect Outlook
                  </a>
                )}
              </p>
            )}
            <div className="grid lg:grid-cols-[340px_1fr]">
              <div className="max-h-[32rem] overflow-auto border-b border-[var(--admin-border)] lg:border-r lg:border-b-0">
                {inboxLoading ? (
                  <p className="px-5 py-6 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[var(--admin-muted)] uppercase">
                    Loading
                  </p>
                ) : inbox.length === 0 ? (
                  inboxError ? null : (
                    <p className="px-5 py-6 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-muted)]">
                      No messages
                    </p>
                  )
                ) : (
                  <ul>
                    {inbox.map((item) => {
                      const active = item.id === openMessageId;
                      const from = item.fromName || item.fromEmail || "Unknown";
                      return (
                        <li key={item.id} className="border-b border-[var(--admin-border)] last:border-b-0">
                          <button
                            type="button"
                            onClick={() => void openInboxMessage(item.id)}
                            className={`block w-full px-5 py-4 text-left ${active ? "bg-[var(--admin-invert)] text-[var(--admin-invert-text)]" : "hover:bg-[var(--admin-hover)]"}`}
                          >
                            <span className="flex items-baseline justify-between gap-3">
                              <span className={`truncate font-[family-name:var(--font-grotesque)] text-sm ${active ? "" : item.isRead ? "text-[var(--admin-soft)]" : "text-[var(--admin-strong)]"}`}>
                                {from}
                              </span>
                              <span className={`shrink-0 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.08em] uppercase ${active ? "text-[var(--admin-invert-soft)]" : "text-[var(--admin-muted)]"}`}>
                                {mailDate(item.receivedAt)}
                              </span>
                            </span>
                            <span className={`mt-1 block truncate font-[family-name:var(--font-grotesque)] text-sm ${active ? "text-[var(--admin-invert-text)]" : "text-[var(--admin-strong)]"}`}>
                              {item.subject}
                            </span>
                            {item.preview && (
                              <span className={`mt-1 block truncate font-[family-name:var(--font-grotesque)] text-sm ${active ? "text-[var(--admin-invert-muted)]" : "text-[var(--admin-muted)]"}`}>
                                {item.preview}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="min-h-64 max-h-[32rem] overflow-auto p-5">
                {messageLoading ? (
                  <p className="font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[var(--admin-muted)] uppercase">
                    Loading
                  </p>
                ) : openMessage ? (
                  <article>
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-[family-name:var(--font-alte-haas-bold)] text-xl text-[var(--admin-strong)]">
                          {openMessage.subject}
                        </h3>
                        <p className="mt-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-soft)]">
                          {openMessage.fromName || openMessage.fromEmail}
                          {openMessage.fromName && openMessage.fromEmail ? ` · ${openMessage.fromEmail}` : ""}
                        </p>
                        <p className="mt-1 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.12em] text-[var(--admin-muted)] uppercase">
                          {mailDate(openMessage.receivedAt)}
                        </p>
                      </div>
                      {openMessage.fromEmail && (
                        <button
                          type="button"
                          onClick={() => replyToInbox(openMessage)}
                          className="shrink-0 border border-[var(--admin-border)] px-3 py-2 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-soft)] uppercase hover:border-[var(--admin-line)] hover:text-[var(--admin-strong)]"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                    {openMessage.bodyType === "html" ? (
                      <iframe
                        title={openMessage.subject}
                        sandbox="allow-popups allow-popups-to-escape-sandbox"
                        srcDoc={openMessage.body}
                        className="email-sheet h-[24rem] w-full bg-[#ffffff]"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap font-[family-name:var(--font-grotesque)] text-sm leading-6 text-[var(--admin-text)]">
                        {openMessage.body}
                      </p>
                    )}
                  </article>
                ) : (
                  <p className="font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-muted)]">
                    Choose a message.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {mails.length > 0 && (
          <div
            className={`mb-8 grid gap-4 ${mails.length > 1 ? "md:grid-cols-2" : "md:max-w-[380px]"}`}
          >
            {mails.map((mail) => (
              <aside key={mail.id} className="h-fit border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.18em] text-[var(--admin-strong)] uppercase">
                    Send mail
                  </h2>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => duplicateMail(mail)}
                      className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-soft)] uppercase hover:text-[var(--admin-strong)]"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => closeMail(mail.id)}
                      className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-muted)] uppercase hover:text-[var(--admin-strong)]"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <p className="mb-4 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.14em] text-[var(--admin-muted)] uppercase">
                  From info@flowgeist.net
                </p>
                {mail.error && (
                  <p className="mb-4 font-[family-name:var(--font-grotesque)] text-sm leading-5 text-[var(--admin-note)]">
                    {mail.error}
                  </p>
                )}
                <form onSubmit={(event) => sendMail(event, mail)} className="space-y-4">
                  <div className="block">
                    <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-muted)] uppercase">
                      To
                    </span>
                    <div className="relative">
                      <input
                        value={mail.to}
                        autoComplete="off"
                        autoFocus={mail.id === focusMailId}
                        onFocus={(event) => {
                          if (mail.to.trim()) {
                            setSuggestMailId(mail.id);
                            setSuggestIndex(0);
                          }
                          if (mail.id !== focusMailId) return;
                          event.currentTarget.select();
                          setFocusMailId(null);
                        }}
                        onBlur={() => {
                          setSuggestMailId((current) => (current === mail.id ? null : current));
                        }}
                        onChange={(event) => {
                          const value = event.target.value;
                          updateMail(mail.id, { to: value });
                          setSuggestMailId(value.trim() ? mail.id : null);
                          setSuggestIndex(0);
                        }}
                        onKeyDown={(event) => {
                          const matches = promoterMatches(promoters, mail.to);
                          if (suggestMailId !== mail.id || matches.length === 0) return;
                          if (event.key === "ArrowDown") {
                            event.preventDefault();
                            setSuggestIndex((index) => (index + 1) % matches.length);
                          } else if (event.key === "ArrowUp") {
                            event.preventDefault();
                            setSuggestIndex((index) => (index - 1 + matches.length) % matches.length);
                          } else if (event.key === "Enter") {
                            event.preventDefault();
                            const pick = matches[Math.min(suggestIndex, matches.length - 1)];
                            if (pick) pickPromoter(mail, pick);
                          } else if (event.key === "Escape") {
                            setSuggestMailId(null);
                          }
                        }}
                        className="w-full border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-strong)] outline-none focus:border-[var(--admin-line)]"
                      />
                      {suggestMailId === mail.id &&
                        promoterMatches(promoters, mail.to).length > 0 && (
                          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto border border-[var(--admin-border)] bg-[var(--admin-field)]">
                            {promoterMatches(promoters, mail.to).map((promoter, index) => {
                              const active = index === Math.min(suggestIndex, promoterMatches(promoters, mail.to).length - 1);
                              return (
                                <li key={promoter.id}>
                                  <button
                                    type="button"
                                    onMouseDown={(event) => {
                                      event.preventDefault();
                                      pickPromoter(mail, promoter);
                                    }}
                                    onMouseEnter={() => setSuggestIndex(index)}
                                    className={`flex w-full min-w-0 items-baseline justify-between gap-3 px-3 py-2 text-left ${
                                      active ? "bg-[var(--admin-invert)] text-[var(--admin-invert-text)]" : "text-[var(--admin-strong)] hover:bg-[var(--admin-hover)]"
                                    }`}
                                  >
                                    <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-grotesque)] text-sm">
                                      {promoter.name}
                                    </span>
                                    <span
                                      className={`min-w-0 max-w-[58%] truncate text-right font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.04em] ${
                                        active ? "text-[var(--admin-invert-muted)]" : "text-[var(--admin-muted)]"
                                      }`}
                                    >
                                      {promoter.email}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                    </div>
                  </div>
                  <label className="block">
                    <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-muted)] uppercase">
                      Subject
                    </span>
                    <input
                      value={mail.subject}
                      onChange={(event) => updateMail(mail.id, { subject: event.target.value })}
                      className="w-full border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-strong)] outline-none focus:border-[var(--admin-line)]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-muted)] uppercase">
                      Message
                    </span>
                    <textarea
                      value={mail.body}
                      onChange={(event) => updateMail(mail.id, { body: event.target.value })}
                      rows={8}
                      className="w-full resize-y border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-strong)] outline-none focus:border-[var(--admin-line)]"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={mail.sending}
                    className="w-full border border-[var(--admin-invert)] bg-[var(--admin-invert)] px-4 py-3 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[var(--admin-invert-text)] uppercase disabled:opacity-50"
                  >
                    {mail.sending ? "Sending" : "Send"}
                  </button>
                </form>
              </aside>
            ))}
          </div>
        )}

        <div className={`grid gap-8 ${formOpen ? "lg:grid-cols-[1fr_360px]" : ""}`}>
          <section>
            {loading ? (
              <p className="font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[var(--admin-muted)] uppercase">
                Loading
              </p>
            ) : filtered.length === 0 ? (
              <div className="border border-[var(--admin-border)] px-6 py-16 text-center">
                <p className="font-[family-name:var(--font-alte-haas-bold)] text-xl text-[var(--admin-strong)]">Nothing saved yet</p>
                <p className="mt-3 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-muted)]">
                  Add promoters, clubs, events, notes, links, or assets. Each asset link can have a name and a URL.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--admin-border)] border border-[var(--admin-border)]">
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
                        <h2 className="font-[family-name:var(--font-alte-haas-bold)] text-lg text-[var(--admin-strong)]">
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
                            className="mt-1 block text-left font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.14em] text-[var(--admin-muted)] uppercase"
                          >
                            {subtitle}
                          </button>
                        )}
                        {"email" in row && row.email && (
                          <button
                            type="button"
                            onClick={() => openMail(row.email, title)}
                            title="Send mail"
                            className="mt-2 block text-left font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-soft)] underline-offset-4 hover:text-[var(--admin-strong)] hover:underline"
                          >
                            {row.email}
                          </button>
                        )}
                        {links.length > 0 && (
                          <div className="mt-3 border border-[var(--admin-border)]">
                            <div className="grid grid-cols-2 border-b border-[var(--admin-border)] px-3 py-2 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-faint)] uppercase">
                              <span>Name</span>
                              <span className="text-right">Link</span>
                            </div>
                            {links.map((link, index) => (
                              <div
                                key={`${row.id}-link-${index}`}
                                className="grid grid-cols-2 items-center gap-6 border-b border-[var(--admin-border)] px-3 py-2.5 last:border-b-0"
                              >
                                <span className="truncate font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-strong)]">
                                  {link.name || "—"}
                                </span>
                                {link.url ? (
                                  <a
                                    href={hrefFor(link.url)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={link.url}
                                    className="truncate text-right font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-link)] underline-offset-2 hover:text-[var(--admin-strong)] hover:underline"
                                  >
                                    {link.url.replace(/^https?:\/\//, "")}
                                  </a>
                                ) : (
                                  <span className="text-right font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-faint)]">
                                    —
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {"notes" in row && row.notes && (
                          <p className="mt-2 line-clamp-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-muted)]">
                            {row.notes}
                          </p>
                        )}
                        {"body" in row && row.body && (
                          <p className="mt-2 line-clamp-3 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-muted)]">
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
                              className="text-[var(--admin-soft)] hover:text-[var(--admin-strong)]"
                            >
                              Send
                            </button>
                            <button
                              type="button"
                              onClick={() => copyText(row.email)}
                              className="text-[var(--admin-muted)] hover:text-[var(--admin-strong)]"
                            >
                              Copy mail
                            </button>
                          </>
                        )}
                        <button type="button" onClick={() => openEdit(row)} className="text-[var(--admin-soft)] hover:text-[var(--admin-strong)]">
                          Edit
                        </button>
                        <button type="button" onClick={() => onDelete(row.id)} className="text-[var(--admin-faint)] hover:text-[var(--admin-strong)]">
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
            <aside className="h-fit border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.18em] text-[var(--admin-strong)] uppercase">
                  {editingId ? "Edit entry" : "New entry"}
                </h2>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-muted)] uppercase hover:text-[var(--admin-strong)]"
                >
                  Close
                </button>
              </div>
              <form onSubmit={onSubmit} className="space-y-4">
                {!editingId && section === "promoters" && (
                  <div className="flex gap-2">
                    <input
                      ref={csvInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) void importPromoters(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={downloadPromoterTemplate}
                      className="flex-1 border border-[var(--admin-border)] px-3 py-2 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-soft)] uppercase transition hover:border-[var(--admin-line)] hover:text-[var(--admin-strong)]"
                    >
                      CSV template
                    </button>
                    <button
                      type="button"
                      disabled={importing}
                      onClick={() => csvInputRef.current?.click()}
                      className="flex-1 border border-[var(--admin-border)] px-3 py-2 font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-soft)] uppercase transition hover:border-[var(--admin-line)] hover:text-[var(--admin-strong)] disabled:opacity-50"
                    >
                      {importing ? "Importing" : "Import CSV"}
                    </button>
                  </div>
                )}
                {FIELDS[section].map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-muted)] uppercase">
                      {field.label}
                    </span>
                    {field.type === "textarea" ? (
                      <textarea
                        value={draft[field.key] ?? ""}
                        onChange={(event) =>
                          setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                        rows={5}
                        className="w-full resize-y border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-strong)] outline-none focus:border-[var(--admin-line)]"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={draft[field.key] ?? field.options?.[0] ?? ""}
                        onChange={(event) =>
                          setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                        className="w-full border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-strong)] outline-none focus:border-[var(--admin-line)]"
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
                        className="w-full border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-strong)] outline-none placeholder:text-[var(--admin-faint)] focus:border-[var(--admin-line)]"
                      />
                    )}
                  </label>
                ))}

                {section === "assets" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-muted)] uppercase">
                        Links
                      </span>
                      <button
                        type="button"
                        onClick={() => setAssetLinks([...assetDraftLinks, { name: "", url: "" }])}
                        className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-soft)] uppercase hover:text-[var(--admin-strong)]"
                      >
                        Add link
                      </button>
                    </div>
                    {assetDraftLinks.map((link, index) => (
                      <div key={`asset-link-${index}`} className="space-y-2 border border-[var(--admin-border)] p-3">
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
                          className="w-full border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-strong)] outline-none placeholder:text-[var(--admin-faint)] focus:border-[var(--admin-line)]"
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
                          className="w-full border border-[var(--admin-border)] bg-[var(--admin-input)] px-3 py-2 font-[family-name:var(--font-grotesque)] text-sm text-[var(--admin-strong)] outline-none placeholder:text-[var(--admin-faint)] focus:border-[var(--admin-line)]"
                        />
                        {assetDraftLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setAssetLinks(assetDraftLinks.filter((_, itemIndex) => itemIndex !== index))}
                            className="font-[family-name:var(--font-pt-mono)] text-[10px] tracking-[0.16em] text-[var(--admin-faint)] uppercase hover:text-[var(--admin-strong)]"
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
                  className="w-full border border-[var(--admin-invert)] bg-[var(--admin-invert)] px-4 py-3 font-[family-name:var(--font-pt-mono)] text-[11px] tracking-[0.16em] text-[var(--admin-invert-text)] uppercase disabled:opacity-50"
                >
                  {saving ? "Saving" : "Save"}
                </button>
              </form>
            </aside>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4">
          <div className="flex items-center gap-5">
            {FLOWGEIST_SOCIALS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => copyText(item.href, `Copied ${item.label}`)}
                aria-label={`Copy ${item.label}`}
                title={item.href}
                className="text-[var(--admin-muted)] transition hover:text-[var(--admin-strong)]"
              >
                <SocialMark id={item.id} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={light ? "Dark mode" : "Light mode"}
            title={light ? "Dark mode" : "Light mode"}
            className="text-[var(--admin-muted)] transition hover:text-[var(--admin-strong)]"
          >
            {light ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M16.5 14.2A6.2 6.2 0 0 1 9.8 7.5 6.4 6.4 0 1 0 16.5 14.2z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="3.4" />
                <path d="M12 3.6v2.1M12 18.3v2.1M3.6 12h2.1M18.3 12h2.1M6.1 6.1l1.5 1.5M16.4 16.4l1.5 1.5M17.9 6.1l-1.5 1.5M7.6 16.4l-1.5 1.5" />
              </svg>
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
