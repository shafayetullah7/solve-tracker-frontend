import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
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
});