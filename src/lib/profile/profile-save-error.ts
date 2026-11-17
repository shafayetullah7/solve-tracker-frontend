export class ProfileSaveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileSaveError";
  }
}