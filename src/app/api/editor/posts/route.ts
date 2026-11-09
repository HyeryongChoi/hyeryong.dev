import { NextResponse } from "next/server";
import { withEditor } from "@/lib/editor-guard";
import { errorResponse } from "@/lib/editor-route";
import { listPosts } from "@/lib/github-content";
import { createGitClient } from "@/lib/github-octokit";

export const dynamic = "force-dynamic";

export const GET = withEditor(async (_req, editor) => {
  try {
    return NextResponse.json(await listPosts(createGitClient(editor.accessToken)));
  } catch (error) {
    return errorResponse(error);
  }
});
