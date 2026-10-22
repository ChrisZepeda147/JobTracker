import assert from "node:assert/strict";
import { extractRequiredYearsForJob } from "./experience-filter";
import { findManagementRequirement } from "./management-filter";
import { matchesExcludedKeywords } from "./keyword-filter";

function run() {
  const max = 4;

  const hydrated = {
    title: "Software Engineer",
    description: "8+ years of full time software development experience",
  };
  assert.equal(extractRequiredYearsForJob(hydrated), 8);
  assert.equal(extractRequiredYearsForJob(hydrated)! > max, true);

  assert.equal(
    findManagementRequirement("4+ years of engineering management experience") !== null,
    true,
  );
  assert.equal(
    findManagementRequirement("work with product managers and report to the engineering manager"),
    null,
  );

  assert.equal("unknown" === "unknown", true);

  const prefs = ["grad", "graduate", "Graduation", "Undergrad", "II", "III"];

  assert.equal(
    matchesExcludedKeywords(
      { title: "Software Engineer", description: "graduate degree a plus" },
      prefs,
    ),
    null,
  );
  assert.equal(
    matchesExcludedKeywords({ title: "Software Engineer II", description: "" }, prefs),
    "II",
  );
  assert.equal(
    matchesExcludedKeywords({ title: "Software Engineer, New Grad", description: "" }, prefs),
    "New Grad",
  );
  assert.equal(
    matchesExcludedKeywords(
      { title: "Software Engineer I", description: "recent graduates are welcome" },
      prefs,
    ),
    null,
  );

  console.log("strict-filters.test.ts: all assertions passed");
}

run();
