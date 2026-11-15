import { expect, test } from "@playwright/test";
import { assertNoSecretsInStorage, loginUser, registerUser, uniqueUser } from "./fixtures";

test.describe("privacy", () => {
  test("no jwt in document storage after login", async ({ page }) => {
    const user = uniqueUser();
    await registerUser(page, user);
    await loginUser(page, user);
    await assertNoSecretsInStorage(page);
  });

  test("broadcast messages contain only type and tabId", async ({ page }) => {
  await page.addInitScript(() => {
    const Original = globalThis.BroadcastChannel;
    (globalThis as unknown as { __phase47Bc: unknown[] }).__phase47Bc = [];
    globalThis.BroadcastChannel = class extends Original {
      postMessage(data: unknown) {
        (
          globalThis as unknown as { __phase47Bc: unknown[] }
        ).__phase47Bc.push(data);
        super.postMessage(data);
      }
    } as typeof BroadcastChannel;
  });
    const user = uniqueUser();
    await registerUser(page, user);
    await loginUser(page, user);
    const messages = await page.evaluate(() =>
      (globalThis as unknown as { __phase47Bc: unknown[] }).__phase47Bc ?? [],
    );
    for (const msg of messages) {
      const keys = Object.keys(msg as object).sort();
      test.info().annotations.push({ type: "bc", description: JSON.stringify(keys) });
      expect(keys).toEqual(["tabId", "type"]);
    }
  });
});