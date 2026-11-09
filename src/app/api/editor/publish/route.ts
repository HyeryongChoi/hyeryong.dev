import { NextResponse } from "next/server";
import type { PublishRequest } from "@/lib/editor-api-types";
import { withEditor } from "@/lib/editor-guard";
import { errorResponse, readJson } from "@/lib/editor-route";
import { publish } from "@/lib/github-content";
import { createGitClient } from "@/lib/github-octokit";

export const dynamic = "force-dynamic";

export const POST = withEditor(async (req, editor) => {
  try {
    const body = await readJson<PublishRequest>(req);
    return NextResponse.json(await publish(createGitClient(editor.accessToken), body));
  } catch (error) {
    return errorResponse(error);
  }
});
