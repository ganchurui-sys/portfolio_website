import assert from "node:assert/strict";
import test from "node:test";
import { aigcProjects, getAigcProject, AIGC_RETURN_HREF } from "../app/aigc/projects.ts";
import { urbanProjects, urbanProjectRevealDelay } from "../app/urban/projects.ts";

test("the AIGC index includes avatar design, creative TVC, operation design and MBTI job search design", () => {
  assert.deepEqual(aigcProjects.map(({ slug, title }) => ({ slug, title })), [
    { slug: "project-01", title: "01 AI AVATAR DESIGN" },
    { slug: "project-02", title: "02 AI CREATIVE TVC" },
    { slug: "project-03", title: "03 OPERATION DESIGN" },
    { slug: "project-04", title: "04 MBTI JOB SEARCH DESIGN" },
  ]);
  for (const project of aigcProjects) {
    assert.equal(getAigcProject(project.slug), project);
  }
  assert.equal(getAigcProject("missing-project"), undefined);
});

test("the remaining removed placeholder project does not resolve", () => {
  assert.equal(getAigcProject("project-05"), undefined);
});

test("project titles retain their staggered entrance timing", () => {
  assert.deepEqual(aigcProjects.map((_, index) => urbanProjectRevealDelay(index)), [
    120,
    340,
    560,
    780,
  ]);
});

test("AIGC return targets its own scene and leaves Urban entries unchanged", () => {
  assert.equal(AIGC_RETURN_HREF, "/?scene=3");
  assert.deepEqual(urbanProjects.map(({ title }) => title), [
    "SELECTED DESIGN WORKS", "UCL final design", "UCL workshop",
  ]);
});
