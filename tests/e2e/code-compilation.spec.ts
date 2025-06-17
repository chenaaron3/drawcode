import console, { log } from 'console';

import { expect, test } from '@playwright/test';

import { TraceDebuggerPage } from './helpers/test-helpers';

test.describe("Code Compilation and Trace Updates", () => {
  let debuggerPage: TraceDebuggerPage;

  test.beforeEach(async ({ page }) => {
    debuggerPage = new TraceDebuggerPage(page);
    await debuggerPage.gotoProblem("two-sum");

    // Select first problem and wait for it to load
    await debuggerPage.waitForTraceToLoad();
  });

  test("should update trace when code is modified and compiled", async ({
    page,
  }) => {
    // Test Plan:
    // 1. Get initial workspace state
    // 2. Get initial editor state
    // 3. Modify the code with a simple function that should generate different trace
    // 4. Compile the code
    // 5. Check that the workspace has been updated
    // 6. Check that the editor state has been updated

    // Get initial editor state
    const initialCodeContent = await debuggerPage.getCodeContent();
    console.log("Initial editor state captured");

    // Modify the code with a simple function that should generate different trace
    const newCode = `x = 1
print(x)
y = x + 2
print(y)`;

    await debuggerPage.editCode(newCode);
    console.log("✅ Code modified in editor");

    // Compile the code
    expect(await debuggerPage.compileCode()).toBe(true);
    console.log("✅ Compilation completed");

    // Check if navigation controls are now available
    expect(await debuggerPage.hasNavigationControls()).toBe(true);
    console.log("✅ Navigation controls available after compilation");

    // Test that we can navigate through the new trace
    expect(await debuggerPage.navigateNext()).toBe(true);

    // Check that the editor state has been updated
    const currentCodeContent = await debuggerPage.getCodeContent();
    expect(currentCodeContent).not.toBe(initialCodeContent);
    const expectedLines = newCode.split("\n");
    for (const line of expectedLines) {
      expect(currentCodeContent).toContain(line);
    }
    console.log("✅ Editor state updated with new code");
  });

  test("should show compilation errors for invalid code", async ({ page }) => {
    // Type invalid Python code
    const invalidCode = `print(x)`;
    await debuggerPage.editCode(invalidCode);
    console.log("✅ Invalid code entered");
    // Try to compile
    expect(await debuggerPage.compileCode()).toBe(true);
    // Check for error display
    expect(await debuggerPage.isErrorDisplayed()).toBe(true);
  });
});
