import { expect, test } from '@playwright/test';

import { TraceDebuggerPage } from './helpers/test-helpers';

test.describe("Problem Switching", () => {
  let debuggerPage: TraceDebuggerPage;

  test.beforeEach(async ({ page }) => {
    debuggerPage = new TraceDebuggerPage(page);
    await debuggerPage.goto();
  });

  test("should switch between problems and update code", async ({ page }) => {
    // Test 1: Click into each problem and test that the code is updating

    const problems = await debuggerPage.getAllProblems();
    expect(problems.length).toBeGreaterThan(0);

    console.log("Available problems:", problems);

    let previousCodeContent = "";

    // Test switching to first 3 problems
    for (let i = 0; i < Math.min(3, problems.length); i++) {
      await debuggerPage.selectProblem(i);

      // Check that code content is loaded
      const codeContent = await debuggerPage.getCodeContent();
      expect(codeContent.length).toBeGreaterThan(0);

      // Check that this problem's code is different from the previous problem
      if (i > 0) {
        expect(codeContent).not.toBe(previousCodeContent);
        console.log(
          `✅ Problem ${i + 1} (${
            problems[i]
          }) has different code from Problem ${i} (${problems[i - 1]})`
        );
      }

      console.log(
        `✅ Problem ${i + 1} (${problems[i]}) loaded with code content`
      );

      // Store current code for next iteration
      previousCodeContent = codeContent;
    }
  });

  test("should load different problem inputs when switching problems", async ({
    page,
  }) => {
    const problems = await debuggerPage.getAllProblems();

    if (problems.length > 1) {
      // Get first problem's inputs
      await debuggerPage.selectProblem(0);
      const firstInputs = await debuggerPage.getInputsContent();

      // Switch to second problem
      await debuggerPage.selectProblem(1);
      const secondInputs = await debuggerPage.getInputsContent();

      // Inputs should be different (unless by coincidence they're the same)
      expect(firstInputs).not.toBe(secondInputs);
    }
  });
});
