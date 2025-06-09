import { expect, test } from '@playwright/test';

import { TraceDebuggerPage } from './helpers/test-helpers';

test.describe("Navigation Controls", () => {
  let debuggerPage: TraceDebuggerPage;

  test.beforeEach(async ({ page }) => {
    debuggerPage = new TraceDebuggerPage(page);
    await debuggerPage.gotoProblem("two-sum");

    // Select first problem and wait for it to load
    await debuggerPage.waitForTraceToLoad();
  });

  test("should navigate forward through trace steps and update workspace", async ({
    page,
  }) => {
    // Test Plan:
    // 1. Store the workspace content
    // 2. Navigate forward
    // 3. Check that the workspace has been updated
    // 4. Continue until the end of the trace

    // Check if navigation controls are available
    expect(await debuggerPage.hasNavigationControls()).toBe(true);

    let stepCount = 0;
    let previousWorkspaceContent = "";

    // 2. Navigate forward and 3. Check that the workspace has been updated
    // 4. Continue until the end of the trace
    while (true) {
      const navigated = await debuggerPage.navigateNext();

      if (!navigated) {
        console.log(`Reached end of trace after ${stepCount} steps`);
        break;
      }

      stepCount++;

      // Verify workspace is still visible and responsive
      expect(await debuggerPage.isWorkspaceVisible()).toBe(true);

      // Get current workspace content
      const currentWorkspaceContent = await debuggerPage.getWorkspaceContent();

      // Check that the workspace content has changed
      expect(currentWorkspaceContent).not.toBe(previousWorkspaceContent);

      // Update previous content for next iteration
      previousWorkspaceContent = currentWorkspaceContent;
    }

    // Verify we actually navigated through some steps
    expect(stepCount).toBeGreaterThan(0);
    console.log(`✅ Successfully navigated through ${stepCount} trace steps`);
  });
});
