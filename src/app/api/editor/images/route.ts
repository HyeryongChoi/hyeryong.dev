import { NextResponse } from "next/server";
import type { UploadImageRequest } from "@/lib/editor-api-types";
import { withEditor } from "@/lib/editor-guard";
import { errorResponse, readJson } from "@/lib/editor-route";
import { ValidationError, uploadImage } from "@/lib/github-content";
import { createGitClient } from "@/lib/github-octokit";

export const dynamic = "force-dynamic";

export const POST = withEditor(async (req, editor) => {
  try {
    const body = await readJson<UploadImageRequest>(req);
    if (typeof body.filename !== "string" || typeof body.base64 !== "string") {
      throw new ValidationError([{ field: "image", message: "filename과 base64가 필요합니다." }]);
    }
    return NextResponse.json(await uploadImage(createGitClient(editor.accessToken), body.filename, body.base64));
  } catch (error) {
    return errorResponse(error);
  }
});
