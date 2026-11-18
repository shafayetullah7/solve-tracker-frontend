import { describe, expect, it } from "vitest";
import { reduceAddProblemState } from "./add-state";

describe("reduceAddProblemState", () => {
  it("cycles through add flow", () => {
    let state = reduceAddProblemState({ status: "idle" }, { type: "start" });
    expect(state.status).toBe("adding");
    state = reduceAddProblemState(state, { type: "done" });
    expect(state.status).toBe("added");
    state = reduceAddProblemState(state, { type: "reset" });
    expect(state.status).toBe("idle");
  });
});