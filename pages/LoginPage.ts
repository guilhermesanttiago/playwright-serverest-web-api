import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly alertMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('senha');
    this.loginButton = page.getByTestId('entrar');
    this.alertMessage = page.getByTestId('alert-message') ?? page.locator('.alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/home/, { timeout: 10_000 });
  }

  async expectErrorMessage(expectedTextFragment: string | RegExp) {
    await expect(this.alertMessage).toBeVisible();
    await expect(this.alertMessage).toContainText(expectedTextFragment);
  }
}
