import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly firstAddToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstAddToCartButton = page.getByTestId('adicionarNaLista').first();
  }

  async goto() {
    await this.page.goto('/home');
  }

  async addFirstProductToCart() {
    await this.firstAddToCartButton.click();
  }
}

export class ListaDeProdutosPage {
  readonly page: Page;
  readonly totalLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.totalLabel = page.getByText(/Total:\s*\d+/);
  }

  async expectOnListaDeProdutosPage() {
    await expect(this.page).toHaveURL(/\/minhaListaDeProdutos/);
  }

  async expectTotalAtLeast(minimum: number) {
    await expect(this.totalLabel).toBeVisible();
    const text = await this.totalLabel.textContent();
    const match = text?.match(/(\d+)/);
    const total = match ? parseInt(match[1], 10) : 0;
    expect(total).toBeGreaterThanOrEqual(minimum);
  }
}
