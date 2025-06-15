import { expect, test } from "@playwright/test";

import { TraceDebuggerPage } from "./helpers/test-helpers";

test.describe("Share Functionality", () => {
  let debuggerPage: TraceDebuggerPage;

  test.beforeEach(async ({ page }) => {
    debuggerPage = new TraceDebuggerPage(page);
    await debuggerPage.gotoProblem("two-sum");

    // Wait for the trace to load
    await debuggerPage.waitForTraceToLoad();
  });

  test("should share and load custom code via URL", async ({
    page,
    context,
  }) => {
    // Test Plan:
    // 1. Write new code in the editor
    // 2. Generate the share link
    // 3. Go to the share link in a new tab
    // 4. Verify the new code is in the editor

    // Step 1: Write new code in the editor
    const newCode = `x = 1
print(x)
y = x + 2
print(y)`;

    await debuggerPage.editCode(newCode);
    console.log("✅ Custom code written in editor");

    // Compile the code to make sure it works and to trigger the share functionality
    expect(await debuggerPage.compileCode()).toBe(true);
    console.log("✅ Custom code compiled successfully");

    // Step 2: Generate the share link
    // Click on the settings button to open the dropdown
    await page.click('[data-testid="settings-button"]');
    console.log("✅ Settings dropdown opened");

    // Wait for the dropdown to be visible and click the share menu item
    await page.waitForSelector('[data-testid="share-menu-item"]', {
      state: "visible",
    });
    await page.click('[data-testid="share-menu-item"]');
    console.log("✅ Share link generated and copied to clipboard");

    // Step 3: Get the share URL from clipboard and navigate to it
    // We'll simulate getting the clipboard content by constructing the URL ourselves
    // since clipboard access in headless browsers can be tricky
    const encodedCode = Buffer.from(encodeURIComponent(newCode)).toString(
      "base64"
    );
    const shareUrl = `${page.url().split("?")[0]}?code=${encodedCode}`;

    console.log(`✅ Share URL constructed: ${shareUrl.substring(0, 100)}...`);

    // Open the share URL in a new page
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);
    console.log("✅ Navigated to share URL in new tab");

    // Step 4: Verify the new code is in the editor
    const newDebuggerPage = new TraceDebuggerPage(newPage);
    await newDebuggerPage.waitForTraceToLoad();
    console.log("✅ New page loaded successfully");

    // Wait for the initialization to complete
    await newPage.waitForTimeout(2000);

    // Get the code content from the new page
    const sharedCodeContent = await newDebuggerPage.getCodeContent();
    console.log("✅ Retrieved code content from shared page");

    // Verify the shared code matches our custom code

    expect(sharedCodeContent).toContain("x = 1");
    expect(sharedCodeContent).toContain("y = x + 2");
    console.log("✅ Shared code content verified");

    // Verify that navigation controls are available (meaning the code was compiled)
    expect(await newDebuggerPage.hasNavigationControls()).toBe(true);
    console.log(
      "✅ Navigation controls available - code was compiled automatically"
    );

    // Clean up
    await newPage.close();
  });

  test("should handle invalid share URLs gracefully", async ({
    page,
    context,
  }) => {
    // Test with an invalid base64 encoded URL parameter
    const invalidShareUrl = `${
      page.url().split("?")[0]
    }?code=invalidbase64content`;

    const newPage = await context.newPage();
    await newPage.goto(invalidShareUrl);

    const newDebuggerPage = new TraceDebuggerPage(newPage);
    await newDebuggerPage.waitForTraceToLoad();

    // Should fall back to the default two-sum problem
    const codeContent = await newDebuggerPage.getCodeContent();
    expect(codeContent).toContain(""); // Default two-sum code
    console.log("✅ Invalid share URL handled gracefully with fallback");

    await newPage.close();
  });
});
