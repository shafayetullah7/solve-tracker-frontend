import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, test } from "vitest";
import { mockPlatformEntries } from "../../lib/platforms/catalog-fixture";
import {
  PlatformCatalogContextOverride,
  type PlatformCatalogContextValue,
} from "../../lib/platforms/platform-catalog-context";
import { ProblemFormFields } from "./ProblemFormFields";

function readyCatalogStub(): PlatformCatalogContextValue {
  return {
    status: () => "ready",
    entries: () => mockPlatformEntries,
    error: () => undefined,
    loadCatalog: async () => {},
    reloadCatalog: async () => {},
  };
}

function noop() {}

afterEach(() => {
  document.body.innerHTML = "";
});

function renderFields(initialUrl: string) {
  const [url, setUrl] = createSignal(initialUrl);
  render(() => (
    <PlatformCatalogContextOverride value={readyCatalogStub()}>
    <ProblemFormFields
      mode="create"
      formId="test-form"
      title={() => ""}
      onTitleInput={noop}
      url={url}
      onUrlInput={setUrl}
      platformProblemId={() => ""}
      onPlatformProblemIdInput={noop}
      difficulty={() => ""}
      onDifficultyInput={noop}
      rating={() => ""}
      onRatingInput={noop}
      notes={() => ""}
      onNotesInput={noop}
      alreadySolved={() => false}
      onAlreadySolvedChange={noop}
      selectedTopicIds={() => new Set<string>()}
      onTopicToggle={noop}
      topics={() => []}
      topicsLoading={() => false}
      topicsTruncated={() => false}
      fieldErrors={() => ({})}
      formError={() => undefined}
      existingProblemId={() => undefined}
    />
    </PlatformCatalogContextOverride>
  ));
}

describe("ProblemFormFields", () => {
  test("shows judge id label and empty-url preview prompt", () => {
    renderFields("");

    expect(screen.getByLabelText(/Judge problem ID/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The judge site is detected from the problem URL above/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Enter a URL to detect the judge/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Preview only/i)).toBeInTheDocument();
  });

  test("shows detected platform mark from url", () => {
    renderFields("https://leetcode.com/problems/two-sum/");
    expect(screen.getByText("LeetCode")).toBeInTheDocument();

    document.body.innerHTML = "";
    renderFields("https://example.com/p");
    expect(screen.getByText("Other")).toBeInTheDocument();
  });
});