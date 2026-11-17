import { render } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { AuthStatus } from "../../lib/auth/context";

const mocks = vi.hoisted(() => ({
  topicsList: vi.fn(),
  progressSummaries: vi.fn(),
  getProfile: vi.fn(),
  auth: undefined as unknown,
}));

vi.mock("@solidjs/meta", () => ({ Title: () => null }));
vi.mock("@solidjs/router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@solidjs/router")>()),
  useNavigate: () => vi.fn(),
}));
vi.mock("../../lib/auth/context", () => ({ useAuth: () => mocks.auth }));
vi.mock("../../lib/api/modules/topics.api", () => ({
  createTopicsApi: () => ({ list: mocks.topicsList }),
}));
vi.mock("../../lib/api/modules/progress.api", () => ({
  createProgressApi: () => ({ getSummaries: mocks.progressSummaries }),
}));
vi.mock("../../lib/api/modules/profile.api", () => ({
  createProfileApi: () => ({ getProfile: mocks.getProfile }),
}));

import ProfilePage from "./profile";
import TopicsIndex from "./topics/index";

const user = { id: "u1", name: "Ada", email: "ada@example.test" };

function fakeAuth(initial: AuthStatus) {
  const [status, setStatus] = createSignal<AuthStatus>(initial);
  mocks.auth = {
    status,
    user: () => (status() === "authenticated" ? user : undefined),
    productClient: {},
    establishSession: vi.fn(),
    logout: vi.fn(),
    retryLogout: vi.fn(),
    revocationUnconfirmed: () => false,
  };
  return setStatus;
}

beforeEach(() => {
  mocks.topicsList.mockReset().mockResolvedValue({ items: [], meta: { total: 0 } });
  mocks.progressSummaries.mockReset().mockResolvedValue({ topics: [] });
  mocks.getProfile.mockReset().mockResolvedValue({
    name: "Ada",
    bio: "",
    work: [],
    education: [],
    avatarUrl: undefined,
  });
});

describe("auth-gated page loads", () => {
  test("topics waits for checking → authenticated, then loads once", async () => {
    const setStatus = fakeAuth("checking");
    render(() => <TopicsIndex />);
    flush();
    expect(mocks.topicsList).not.toHaveBeenCalled();

    setStatus("authenticated");
    flush();
    await vi.waitFor(() => expect(mocks.topicsList).toHaveBeenCalledTimes(1));
    expect(mocks.progressSummaries).toHaveBeenCalledTimes(1);
  });

  test("topics loads immediately when the seed is already authenticated", async () => {
    fakeAuth("authenticated");
    render(() => <TopicsIndex />);
    await vi.waitFor(() => expect(mocks.topicsList).toHaveBeenCalledTimes(1));
  });

  test("profile waits for checking → authenticated, then loads", async () => {
    const setStatus = fakeAuth("checking");
    render(() => <ProfilePage />);
    flush();
    expect(mocks.getProfile).not.toHaveBeenCalled();

    setStatus("authenticated");
    flush();
    await vi.waitFor(() => expect(mocks.getProfile).toHaveBeenCalledTimes(1));
  });
});
