import { test, expect } from '@playwright/test';

function randomEmail() {
  return `qa.login.${Date.now()}.${Math.floor(Math.random() * 10000)}@fidela-case.com`;
}

test.describe('POST /login', () => {
  test('login com sucesso retorna 200 e um token no formato Bearer', async ({ request }) => {
    const email = randomEmail();
    const password = 'Senha@123';

    const createUser = await request.post('/usuarios', {
      data: {
        nome: 'Usuario Login Case',
        email,
        password,
        administrador: 'false',
      },
    });
    expect(createUser.status()).toBe(201);

    const loginResponse = await request.post('/login', {
      data: { email, password },
    });

    expect(loginResponse.status()).toBe(200);
    const body = await loginResponse.json();
    expect(body).toHaveProperty('authorization');
    expect(body.authorization).toMatch(/^Bearer\s.+/);
  });

  test('login com credenciais inválidas retorna 401', async ({ request }) => {
    const response = await request.post('/login', {
      data: {
        email: 'usuario.que.nao.existe@fidela-case.com',
        password: 'senha-qualquer',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toMatch(/email e\/ou senha inv[aá]lidos/i);
  });
});
