import { expect } from '@playwright/test';

import type { Page } from "@playwright/test";

export class TraceDebuggerPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/");
    await this.waitForAppToLoad();
  }

  async gotoProblem(problemId: string) {
    await this.page.goto(`/?problemId=${problemId}`);
    await this.waitForAppToLoad();
  }

  async waitForAppToLoad() {
    await this.page.waitForSelector('[data-testid="code-editor-read"]', {
      timeout: 15000,
    });
  }

  async waitForTraceToLoad() {
    // Wait for either code editor read/write to appear
    const editorRead = this.page.locator('[data-testid="code-editor-read"]');
    const editorWrite = this.page.locator('[data-testid="code-editor-write"]');

    await Promise.race([
      editorRead.waitFor({ state: "visible", timeout: 10000 }),
      editorWrite.waitFor({ state: "visible", timeout: 10000 }),
    ]);
  }

  async compileCode() {
    const compileButton = this.page.locator('[data-testid="compile-button"]');

    if (await compileButton.isVisible()) {
      await compileButton.click();

      // Wait for either button to become enabled again OR disappear
      await Promise.race([
        expect(compileButton).toBeEnabled({ timeout: 10000 }),
        compileButton.waitFor({ state: "hidden", timeout: 10000 }),
      ]);

      return true;
    }
    return false;
  }

  async editCode(newCode: string) {
    // Click in the editor to focus it
    let codeEditor = this.page.locator('[data-testid="code-editor-read"]');
    await expect(codeEditor).toBeVisible();
    await this.page.waitForTimeout(500);

    // Click on the edit button
    const editButton = this.page.locator('[data-testid="edit-button"]');
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Click into it again to enter edit mode
    codeEditor = this.page.locator(".monaco-editor");
    await expect(codeEditor).toBeVisible();
    await codeEditor.click();

    // Select all text
    await this.page.keyboard.press(
      process.platform === "darwin" ? "Meta+a" : "Control+a",
    );

    // Type new code
    await this.page.keyboard.type(newCode);
  }

  async getCodeContent(): Promise<string> {
    return await this.page.evaluate(() => {
      let codeEditor = document.querySelector(
        '[data-testid="code-editor-read"]',
      );
      if (codeEditor) {
        return codeEditor.textContent || "";
      }

      // Fallback to reading from the code editor
      codeEditor = document.querySelector('[data-testid="code-editor-write"]');
      if (codeEditor) {
        return codeEditor.textContent || "";
      }

      return "";
    });
  }

  async navigateNext(): Promise<boolean> {
    const nextButton = this.page.locator('[data-testid="next-button"]');

    if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
      await nextButton.click();
      return true;
    }
    return false;
  }

  async navigatePrevious(): Promise<boolean> {
    const prevButton = this.page.locator('[data-testid="prev-button"]');

    if ((await prevButton.isVisible()) && (await prevButton.isEnabled())) {
      await prevButton.click();
      return true;
    }
    return false;
  }

  async togglePlayPause(): Promise<boolean> {
    const playButton = this.page.locator('[data-testid="play-button"]');

    if (await playButton.isVisible()) {
      await playButton.click();
      return true;
    }
    return false;
  }

  async isWorkspaceVisible(): Promise<boolean> {
    const workspace = this.page.locator(
      '[data-testid="computation-workspace"]',
    );
    return await workspace.isVisible();
  }

  async getWorkspaceContent(): Promise<string> {
    const workspace = this.page.locator(
      '[data-testid="computation-workspace"]',
    );
    return (await workspace.innerHTML()) || "";
  }

  async getInputsContent(): Promise<string> {
    const inputs = this.page.locator('[data-testid="inputs-section"]');
    return (await inputs.textContent()) || "";
  }

  async hasNavigationControls(): Promise<boolean> {
    const nextButton = this.page.locator('[data-testid="next-button"]');
    return await nextButton.isVisible();
  }

  async isErrorDisplayed(): Promise<boolean> {
    const errorPanel = this.page.locator('[data-testid="error-panel"]');
    return await errorPanel.isVisible();
  }

  async getErrorText(): Promise<string> {
    const errorPanel = this.page.locator(
      '[data-testid="error-panel"], .error, text=Error, text=SyntaxError',
    );
    if (await errorPanel.isVisible()) {
      return (await errorPanel.textContent()) || "";
    }
    return "";
  }
}
