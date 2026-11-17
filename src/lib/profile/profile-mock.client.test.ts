import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MAX_EDUCATION_ENTRIES } from "./profile-editor-target";
import {
  PROFILE_MOCK_LATENCY_MS,
  saveAbout,
  saveEducation,
  saveWork,
} from "./profile-mock.client";
import { ProfileSaveError } from "./profile-save-error";

describe("profile-mock.client", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("saveAbout trims display name", async () => {
    const promise = saveAbout(
      { displayName: "  Alex  ", bio: "Hello" },
      { displayName: "Alex", bio: "Hello" },
    );
    await vi.advanceTimersByTimeAsync(PROFILE_MOCK_LATENCY_MS);
    await expect(promise).resolves.toEqual({ displayName: "Alex", bio: "Hello" });
  });

  test("saveWork drops empty period", async () => {
    const promise = saveWork(
      { id: "w1", organization: " Org ", role: " Dev ", period: "  " },
      [],
      "add",
    );
    await vi.advanceTimersByTimeAsync(PROFILE_MOCK_LATENCY_MS);
    await expect(promise).resolves.toEqual({
      id: "w1",
      organization: "Org",
      role: "Dev",
    });
  });

  test("saveWork update rejects missing id", async () => {
    const promise = saveWork(
      { id: "missing", organization: "A", role: "B" },
      [{ id: "w1", organization: "X", role: "Y" }],
      "update",
    );
    const assertion = expect(promise).rejects.toBeInstanceOf(ProfileSaveError);
    await vi.advanceTimersByTimeAsync(PROFILE_MOCK_LATENCY_MS);
    await assertion;
  });

  test("saveEducation add rejects at cap", async () => {
    const list = Array.from({ length: MAX_EDUCATION_ENTRIES }, (_, i) => ({
      id: `e${i}`,
      institution: "School",
      program: "CS",
    }));
    const promise = saveEducation(
      { id: "new", institution: "Other", program: "Math" },
      list,
      "add",
    );
    const assertion = expect(promise).rejects.toThrow(/at most/);
    await vi.advanceTimersByTimeAsync(PROFILE_MOCK_LATENCY_MS);
    await assertion;
  });
});