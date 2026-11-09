/** 브라우저에서 이미지를 webp로 변환·축소한다 (업로드 전 처리). */

export const MAX_IMAGE_WIDTH = 1600;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export class ImageProcessingError extends Error {}

export async function toWebp(file: Blob, maxWidth = MAX_IMAGE_WIDTH, quality = 0.85): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageProcessingError("이미지를 읽을 수 없어요.");
  }
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob || blob.type !== "image/webp") {
    throw new ImageProcessingError("이 브라우저는 webp 변환을 지원하지 않아요. Chrome이나 Edge에서 시도해 주세요.");
  }
  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new ImageProcessingError("변환한 이미지가 4MB를 넘어요. 더 작은 이미지를 써 주세요.");
  }
  return blob;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** 파일 이름에서 확장자를 뺀 alt 텍스트 */
export function altFromFilename(name: string): string {
  return name.replace(/\.[^.]*$/, "").replace(/[[\]]/g, "").trim() || "image";
}
