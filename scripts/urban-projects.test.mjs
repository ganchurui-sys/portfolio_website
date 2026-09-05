import assert from "node:assert/strict";
import test from "node:test";
import {
  getUrbanProject,
  urbanProjectHref,
  urbanProjectRevealDelay,
  urbanProjects,
  URBAN_RETURN_HREF,
} from "../app/urban/projects.ts";

test("four ordered project entries resolve to distinct detail pages", () => {
  assert.equal(urbanProjects.length, 4);
  assert.equal(new Set(urbanProjects.map(({ slug }) => slug)).size, 4);
  urbanProjects.forEach((project, index) => {
    assert.equal(project.title, `portfolio${String(index + 1).padStart(2, "0")}`);
    assert.equal(getUrbanProject(project.slug), project);
    assert.equal(urbanProjectHref(project.slug), `/urban/${project.slug}`);
  });
});

test("titles enter in sequence, not at the same time", () => {
  assert.deepEqual(urbanProjects.map((_, index) => urbanProjectRevealDelay(index)), [
    120, 340, 560, 780,
  ]);
});

test("unuploaded work stays empty and unknown projects are rejected", () => {
  urbanProjects.forEach((project) => {
    assert.equal(project.summary, "");
    assert.deepEqual(project.images, []);
  });
  assert.equal(getUrbanProject("missing-project"), undefined);
});

test("detail-page return targets the Urban scene without the cover loader", () => {
  assert.equal(URBAN_RETURN_HREF, "/?scene=2");
});
