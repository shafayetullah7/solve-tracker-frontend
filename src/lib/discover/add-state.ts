export type AddProblemState =
  | { status: "idle" }
  | { status: "adding" }
  | { status: "added" }
  | { status: "already" }
  | { status: "error"; message: string };

export type AddProblemAction =
  | { type: "start" }
  | { type: "done" }
  | { type: "already" }
  | { type: "fail"; message: string }
  | { type: "reset" };

export function reduceAddProblemState(
  state: AddProblemState,
  action: AddProblemAction,
): AddProblemState {
  switch (action.type) {
    case "start":
      return { status: "adding" };
    case "done":
      return { status: "added" };
    case "already":
      return { status: "already" };
    case "fail":
      return { status: "error", message: action.message };
    case "reset":
      return { status: "idle" };
    default:
      return state;
  }
}