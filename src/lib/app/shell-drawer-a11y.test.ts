import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  getFocusableElements,
  handleDrawerTabKeydown,
} from "./shell-drawer-a11y";

describe("shell-drawer-a11y", () => {
  let root: HTMLDivElement;

  afterEach(() => {
    root.remove();
  });

  beforeEach(() => {
    root = document.createElement("div");
    root.innerHTML = `
      <button type="button" id="first">A</button>
      <a href="/x">Link</a>
      <button type="button" id="last">Z</button>
    `;
    document.body.appendChild(root);
  });

  test("getFocusableElements returns focusable controls", () => {
    expect(getFocusableElements(root)).toHaveLength(3);
  });

  test("handleDrawerTabKeydown wraps from last to first", () => {
    const last = root.querySelector<HTMLElement>("#last")!;
    last.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
    let prevented = false;
    Object.defineProperty(event, "preventDefault", {
      value: () => {
        prevented = true;
      },
    });
    handleDrawerTabKeydown(event, root);
    expect(prevented).toBe(true);
    expect(document.activeElement?.id).toBe("first");
  });
});