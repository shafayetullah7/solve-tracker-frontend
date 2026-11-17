import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import {
  IconClose,
  IconDashboard,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconLibrary,
  IconLogOut,
  IconMenu,
  IconPlus,
  IconTopics,
  IconTrash,
  IconUser,
} from "./index";

afterEach(cleanup);

const icons = [
  ["IconDashboard", IconDashboard],
  ["IconEdit", IconEdit],
  ["IconEye", IconEye],
  ["IconEyeOff", IconEyeOff],
  ["IconLibrary", IconLibrary],
  ["IconTopics", IconTopics],
  ["IconPlus", IconPlus],
  ["IconUser", IconUser],
  ["IconLogOut", IconLogOut],
  ["IconMenu", IconMenu],
  ["IconClose", IconClose],
  ["IconTrash", IconTrash],
] as const;

describe("icons barrel", () => {
  test.each(icons)("%s renders an svg", (_name, Icon) => {
    const view = render(() => <Icon />);
    const svg = view.container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });
});