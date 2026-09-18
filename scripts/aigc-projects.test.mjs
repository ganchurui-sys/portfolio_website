import assert from "node:assert/strict";
import test from "node:test";
import { aigcProjects, getAigcProject, AIGC_RETURN_HREF } from "../app/aigc/projects.ts";
import { urbanProjects, urbanProjectRevealDelay } from "../app/urban/projects.ts";

test("only the existing first AIGC project is available", () => {
  assert.equal(aigcProjects.length, 1);
  assert.equal(aigcProjects[0].title, "PROJECT 01");
  assert.equal(aigcProjects[0].slug, "project-01");
  assert.equal(getAigcProject("project-01"), aigcProjects[0]);
  assert.equal(getAigcProject("missing-project"), undefined);
});

test("removed placeholder projects no longer resolve", () => {
  for (const slug of ["project-02", "project-03", "project-04", "project-05"]) {
    assert.equal(getAigcProject(slug), undefined);
  }
});

test("the remaining title retains its entrance timing", () => {
  assert.deepEqual(aigcProjects.map((_, index) => urbanProjectRevealDelay(index)), [
    120,
  ]);
});

test("AIGC return targets its own scene and leaves Urban entries unchanged", () => {
  assert.equal(AIGC_RETURN_HREF, "/?scene=3");
  assert.deepEqual(urbanProjects.map(({ title }) => title), [
    "SELECTED DESIGN WORKS", "UCL final design", "UCL workshop",
  ]);
});
