import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flowgeist Admin",
  description: "Gestione promoters, clubs, info e assets.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
