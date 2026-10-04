import { test, expect, APIRequestContext, request } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage, ListaDeProdutosPage } from '../../pages/HomePage';


function randomEmail() {
  return `qa.teste.${Date.now()}.${Math.floor(Math.random() * 10000)}@fidela-case.com`;
}

const VALID_PASSWORD = 'Senha@123';
let apiContext: APIRequestContext;
let validUserEmail: string;

test.beforeAll(async () => {
  apiContext = await request.newContext({ baseURL: 'https://serverest.dev' });
  validUserEmail = randomEmail();

  const response = await apiContext.post('/usuarios', {
    data: {
      nome: 'QA Case Fidela',
      email: validUserEmail,
      password: VALID_PASSWORD,
      administrador: 'false',
    },
  });

  expect(response.status(), 'Falha ao criar usuário de teste via API antes da suíte web').toBe(201);
});

test.afterAll(async () => {
  await apiContext.dispose();
});

test.describe('Login', () => {
  test('login com sucesso redireciona para a home', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUserEmail, VALID_PASSWORD);
    await loginPage.expectLoggedIn();
  });

  test('login com senha inválida exibe mensagem de erro', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUserEmail, 'senha-incorreta-qualquer');
    await loginPage.expectErrorMessage(/e-?mail e\/ou senha inv[aá]lidos/i);
  });

  test('login com campo obrigatório vazio não avança e sinaliza o campo', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginButton.click();
    await expect(page).not.toHaveURL(/\/home/);
    await loginPage.expectErrorMessage(/obrigat[oó]rio/i);
  });
});

test.describe('Fluxo funcional pós-login', () => {
  
  test('usuário logado consegue adicionar um produto à lista de compras', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const listaPage = new ListaDeProdutosPage(page);

    await loginPage.goto();
    await loginPage.login(validUserEmail, VALID_PASSWORD);
    await loginPage.expectLoggedIn();

    await homePage.addFirstProductToCart();

    await listaPage.expectOnListaDeProdutosPage();
    await listaPage.expectTotalAtLeast(1);
  });
});
