import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import EditorApp from "@/components/editor/EditorApp";
import EditorLogin from "@/components/editor/EditorLogin";
import { authOptions } from "@/lib/auth";
import { isAllowedLogin } from "@/lib/editor-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog Editor - HYERYONG.DEV",
  robots: { index: false, follow: false },
};

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [session, { error }] = await Promise.all([getServerSession(authOptions), searchParams]);
  const login = (session as { login?: string } | null)?.login;

  if (!session || !isAllowedLogin(login)) {
    return <EditorLogin error={error} />;
  }
  return <EditorApp login={login as string} />;
}
