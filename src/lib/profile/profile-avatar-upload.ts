import { ProfileSaveError } from "./profile-save-error";

export const AVATAR_ACCEPT =
  "image/png,image/jpeg,image/jpg,image/webp,image/gif";

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set(AVATAR_ACCEPT.split(","));

export function validateAvatarFile(file: File): void {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ProfileSaveError("Use a PNG, JPG, WebP, or GIF image.");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new ProfileSaveError("Image must be 5 MB or smaller.");
  }
}

export function pickFirstImageFile(files: FileList | File[] | null | undefined): File | null {
  if (!files) return null;
  const list = files instanceof FileList ? Array.from(files) : files;
  return list.find((file) => file.type.startsWith("image/")) ?? null;
}