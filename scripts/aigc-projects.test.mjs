import assert from "node:assert/strict";
import test from "node:test";
import { aigcProjects, getAigcProject, AIGC_RETURN_HREF } from "../app/aigc/projects.ts";
import { urbanProjects, urbanProjectRevealDelay } from "../app/urban/projects.ts";

test("five AIGC entries resolve to their own projects in order", () => {
  assert.equal(aigcProjects.length, 5);
  assert.equal(new Set(aigcProjects.map(({ slug }) => slug)).size, 5);
  aigcProjects.forEach((project, index) => {
    const number = String(index + 1).padStart(2, "0");
    assert.equal(project.title, `PROJECT ${number}`);
    assert.equal(project.slug, `project-${number}`);
    assert.equal(getAigcProject(project.slug), project);
  });
  assert.equal(getAigcProject("missing-project"), undefined);
});

test("all five titles share the sequential entrance timing", () => {
  assert.deepEqual(aigcProjects.map((_, index) => urbanProjectRevealDelay(index)), [
    120, 340, 560, 780, 1000,
  ]);
});

test("AIGC return targets its own scene and leaves Urban entries unchanged", () => {
  assert.equal(AIGC_RETURN_HREF, "/?scene=3");
  assert.deepEqual(urbanProjects.map(({ title }) => title), [
    "portfolio01", "portfolio02", "portfolio03", "portfolio04",
  ]);
});
