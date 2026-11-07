import { NextResponse } from "next/server";
import { withEditor } from "@/lib/editor-guard";
import { errorResponse } from "@/lib/editor-route";
import { getPost } from "@/lib/github-content";
import { createGitClient } from "@/lib/github-octokit";

export const dynamic = "force-dynamic";

export const GET = withEditor<{ params: Promise<{ id: string }> }>(async (_req, editor, { params }) => {
  try {
    const { id } = await params;
    return NextResponse.json(await getPost(createGitClient(editor.accessToken), id));
  } catch (error) {
    return errorResponse(error);
  }
});
