import { createMemo, flush } from "solid-js";
import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { RouteBoundary } from "./RouteBoundary";

function Hangs() {
  const value = createMemo(async () => {
    await new Promise<void>(() => {});
    return "done";
  });
  return <span>{value()}</span>;
}

describe("RouteBoundary nestedInAppShell", () => {
  test("omits duplicate main-content when nested in AppShell", async () => {
    const { container } = render(() => (
      <main id="main-content">
        <RouteBoundary nestedInAppShell>
          <Hangs />
        </RouteBoundary>
      </main>
    ));
    await flush();
    expect(container.querySelectorAll("#main-content")).toHaveLength(1);
    expect(container.querySelectorAll("main")).toHaveLength(1);
    const status = container.querySelector('[role="status"][aria-label="Loading"]');
    expect(status?.tagName).toBe("DIV");
  });

  test("uses main-content landmark at app root while pending", async () => {
    const { container } = render(() => (
      <RouteBoundary>
        <Hangs />
      </RouteBoundary>
    ));
    await flush();
    expect(container.querySelectorAll("#main-content")).toHaveLength(1);
  });
});