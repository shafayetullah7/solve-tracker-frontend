import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, test, vi } from "vitest";
import { PeopleFollowButton } from "./PeopleFollowButton";

afterEach(cleanup);

describe("PeopleFollowButton", () => {
  test("toggles aria-pressed and labels", async () => {
    const follow = vi.fn().mockResolvedValue(undefined);
    const unfollow = vi.fn().mockResolvedValue(undefined);
    render(() => (
      <PeopleFollowButton
        handle="peer"
        initialFollowing={false}
        follow={follow}
        unfollow={unfollow}
      />
    ));
    const button = screen.getByRole("button", { name: "Follow" });
    expect(button.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(button);
    await waitFor(() => {
      expect(follow).toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Following" }).getAttribute("aria-pressed")).toBe(
        "true",
      );
    });
    fireEvent.click(screen.getByRole("button", { name: "Following" }));
    await waitFor(() => {
      expect(unfollow).toHaveBeenCalled();
    });
  });
});