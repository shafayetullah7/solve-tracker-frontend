import type { FieldErrors } from "./field-errors";
import { codePointLength } from "./unicode";

const TOPIC_NAME_MIN = 1;
const TOPIC_NAME_MAX = 100;

export const TOPIC_MSG = {
  empty: "Topic name must not be empty.",
  tooLong: `Topic name must contain at most ${TOPIC_NAME_MAX} characters.`,
} as const;

export function validateTopicName(values: { name: string }): FieldErrors {
  const out: FieldErrors = {};
  const trimmed = values.name.trim();
  const length = codePointLength(trimmed);
  if (length < TOPIC_NAME_MIN) out.name = TOPIC_MSG.empty;
  else if (length > TOPIC_NAME_MAX) out.name = TOPIC_MSG.tooLong;
  return out;
}