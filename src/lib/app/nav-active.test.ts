import { describe, expect, test } from "vitest";
import {
  isSidebarSectionActive,
  normalizePathname,
  resolveSidebarActive,
} from "./nav-active";

const problemId = "550e8400-e29b-41d4-a716-446655440000";

describe("normalizePathname", () => {
  test("strips trailing slash except root", () => {
    expect(normalizePathname("/")).toBe("/");
    expect(normalizePathname("/app/")).toBe("/app");
    expect(normalizePathname("/app/problems/")).toBe("/app/problems");
  });
});

describe("resolveSidebarActive", () => {
  test("dashboard", () => {
    expect(resolveSidebarActive("/app")).toEqual({
      section: "dashboard",
      addProblem: false,
    });
    expect(resolveSidebarActive("/app/")).toEqual({
      section: "dashboard",
      addProblem: false,
    });
  });

  test("profile", () => {
    expect(resolveSidebarActive("/app/profile")).toEqual({
      section: "profile",
      addProblem: false,
    });
  });

  test("topics", () => {
    expect(resolveSidebarActive("/app/topics")).toEqual({
      section: "topics",
      addProblem: false,
    });
  });

  test("library list and nested routes", () => {
    expect(resolveSidebarActive("/app/problems")).toEqual({
      section: "library",
      addProblem: false,
    });
    expect(resolveSidebarActive("/app/problems/new")).toEqual({
      section: "library",
      addProblem: true,
    });
    expect(resolveSidebarActive(`/app/problems/${problemId}`)).toEqual({
      section: "library",
      addProblem: false,
    });
    expect(resolveSidebarActive(`/app/problems/${problemId}/edit`)).toEqual({
      section: "library",
      addProblem: false,
    });
  });

  test("discover and people profile routes", () => {
    expect(resolveSidebarActive("/app/discover")).toEqual({
      section: "discover",
      addProblem: false,
    });
    expect(resolveSidebarActive("/app/discover/people")).toEqual({
      section: "discover",
      addProblem: false,
    });
    expect(resolveSidebarActive("/app/u/demo-topics")).toEqual({
      section: "discover",
      addProblem: false,
    });
  });

  test("public routes", () => {
    expect(resolveSidebarActive("/")).toEqual({
      section: null,
      addProblem: false,
    });
    expect(resolveSidebarActive("/login")).toEqual({
      section: null,
      addProblem: false,
    });
  });
});

describe("isSidebarSectionActive", () => {
  test("matches section key", () => {
    expect(isSidebarSectionActive("library", "/app/problems")).toBe(true);
    expect(isSidebarSectionActive("library", "/app/topics")).toBe(false);
  });
});