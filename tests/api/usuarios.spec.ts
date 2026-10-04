import { test, expect } from '@playwright/test';

function randomEmail(prefix = 'qa.usuario') {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@fidela-case.com`;
}

test.describe('POST /usuarios — cadastro de usuário', () => {
  test('cadastro com sucesso retorna 201 e o id do usuário criado', async ({ request }) => {
    const email = randomEmail();

    const response = await request.post('/usuarios', {
      data: {
        nome: 'Usuario Teste Case',
        email,
        password: 'Senha@123',
        administrador: 'false',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('_id');
    expect(body.message).toBe('Cadastro realizado com sucesso');
  });

  test('cadastro com e-mail já cadastrado retorna 400', async ({ request }) => {
    const email = randomEmail('qa.duplicado');

    
    const first = await request.post('/usuarios', {
      data: {
        nome: 'Usuario Duplicado',
        email,
        password: 'Senha@123',
        administrador: 'false',
      },
    });
    expect(first.status()).toBe(201);

    
    const second = await request.post('/usuarios', {
      data: {
        nome: 'Usuario Duplicado',
        email,
        password: 'Senha@123',
        administrador: 'false',
      },
    });

    expect(second.status()).toBe(400);
    const body = await second.json();
    expect(body.message).toMatch(/j[aá] est[aá] sendo usado/i);
  });
});
