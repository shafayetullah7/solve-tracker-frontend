import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { Dynamic } from "@solidjs/web";
import { createSignal, flush, Show } from "solid-js";
import { afterEach, describe, expect, test } from "vitest";
import { Button } from "./Button";
import { Panel } from "./Panel";

afterEach(cleanup);

describe("Solid 2 UI composition", () => {
  test("updates value props, named JSX slots, and conditional content", () => {
    function Preview() {
      const [open, setOpen] = createSignal(false);
      return (
        <Panel
          title={open() ? "Expanded" : "Collapsed"}
          actions={<span>Named slot</span>}
        >
          <Button
            onClick={() => setOpen((value) => !value)}
            aria-pressed={open()}
          >
            Toggle
          </Button>
          <Show when={open()} fallback={<p>Hidden</p>}>
            <p>Visible</p>
          </Show>
        </Panel>
      );
    }
    const view = render(() => <Preview />);
    expect(view.getByText("Named slot")).toBeInTheDocument();
    expect(view.getByRole("heading")).toHaveTextContent("Collapsed");
    fireEvent.click(view.getByRole("button"));
    flush();
    expect(view.getByRole("heading")).toHaveTextContent("Expanded");
    expect(view.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    expect(view.getByText("Visible")).toBeInTheDocument();
    expect(view.queryByText("Hidden")).not.toBeInTheDocument();
  });

  test("switches a component reference through Dynamic", () => {
    const First = (props: { label: string }) => <p>First: {props.label}</p>;
    const Second = (props: { label: string }) => <p>Second: {props.label}</p>;
    function Preview() {
      const [second, setSecond] = createSignal(false);
      return (
        <>
          <Button onClick={() => setSecond(true)}>Switch</Button>
          <Dynamic component={second() ? Second : First} label="example" />
        </>
      );
    }
    const view = render(() => <Preview />);
    expect(view.getByText("First: example")).toBeInTheDocument();
    fireEvent.click(view.getByRole("button"));
    flush();
    expect(view.getByText("Second: example")).toBeInTheDocument();
    expect(view.queryByText("First: example")).not.toBeInTheDocument();
  });
});
