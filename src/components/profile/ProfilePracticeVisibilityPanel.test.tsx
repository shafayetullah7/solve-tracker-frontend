import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ProfilePracticeVisibilityPanel } from "./ProfilePracticeVisibilityPanel";

afterEach(cleanup);

describe("ProfilePracticeVisibilityPanel", () => {
  test("shows never-shared line and saves visibility", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(() => (
      <ProfilePracticeVisibilityPanel
        handle="tourist"
        practiceVisibility="private"
        practiceGoal={null}
        publicWeb={false}
        onSave={onSave}
      />
    ));
    expect(screen.getByTestId("never-shared-line")).toBeTruthy();
    fireEvent.click(screen.getByText("Practice summary"));
    const save = screen
      .getAllByRole("button", { name: "Save" })
      .find((el) => el.classList.contains("ml-auto"));
    await waitFor(() => expect(save?.hasAttribute("disabled")).toBe(false));
    fireEvent.click(save!);
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        practiceVisibility: "summary",
        practiceGoal: null,
        publicWeb: false,
      });
    });
  });
  test("tracks persisted changes while preserving unsaved goal edits", async () => {
    const [visibility, setVisibility] = createSignal<"private" | "summary" | "topics">("private");
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(() => (
      <ProfilePracticeVisibilityPanel
        handle="tourist"
        practiceVisibility={visibility()}
        practiceGoal={null}
        publicWeb={false}
        onSave={onSave}
      />
    ));
    fireEvent.change(screen.getByRole("combobox", { name: "Practicing for (optional)" }), { target: { value: "interview" } });
    setVisibility("summary");
    await flush();
    expect(screen.getByLabelText(/Practice summary/)).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Practicing for (optional)" })).toHaveValue("interview");
  });

  test("keeps unsaved visibility after a failed save", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("offline"));
    render(() => (
      <ProfilePracticeVisibilityPanel
        handle="tourist"
        practiceVisibility="private"
        practiceGoal={null}
        publicWeb={false}
        onSave={onSave}
      />
    ));
    fireEvent.click(screen.getByText("Practice summary"));
    const save = screen.getAllByRole("button", { name: "Save" })
      .find((el) => el.classList.contains("ml-auto"))!;
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    await waitFor(() => expect(save).toBeEnabled());
    expect(screen.getByLabelText(/Practice summary/)).toBeChecked();
  });
});
