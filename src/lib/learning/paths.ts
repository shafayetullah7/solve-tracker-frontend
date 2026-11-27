import { APP_ROOT } from "../app/product-routes";

const GUIDE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function learningLibraryPath(): string {
  return `${APP_ROOT}/learning`;
}

export function learningNewGuidePath(): string {
  return `${APP_ROOT}/learning/new`;
}

export function learningGuidePath(guideId: string): string {
  if (!GUIDE_ID.test(guideId)) throw new Error("Invalid guide id.");
  return `${APP_ROOT}/learning/${guideId}`;
}

export function learningStudyPath(guideId: string, nodeId: string): string {
  if (!GUIDE_ID.test(nodeId)) throw new Error("Invalid node id.");
  return `${learningGuidePath(guideId)}/study/${nodeId}`;
}

export function learningEditPath(guideId: string, nodeId: string): string {
  if (!GUIDE_ID.test(nodeId)) throw new Error("Invalid node id.");
  return `${learningGuidePath(guideId)}/edit/${nodeId}`;
}