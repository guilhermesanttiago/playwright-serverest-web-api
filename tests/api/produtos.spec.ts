import { test, expect } from '@playwright/test';

function randomEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@fidela-case.com`;
}

async function criarUsuarioEObterToken(
  request: import('@playwright/test').APIRequestContext,
  administrador: 'true' | 'false',
) {
  const email = randomEmail(administrador === 'true' ? 'qa.admin' : 'qa.comum');
  const password = 'Senha@123';

  const createUser = await request.post('/usuarios', {
    data: { nome: 'Usuario Produto Case', email, password, administrador },
  });
  expect(createUser.status()).toBe(201);

  const loginResponse = await request.post('/login', { data: { email, password } });
  expect(loginResponse.status()).toBe(200);
  const { authorization } = await loginResponse.json();
  return authorization as string;
}

function randomProductName() {
  return `Produto Case ${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

test.describe('POST /produtos — controle de acesso', () => {
  test('cadastro de produto sem token retorna 401', async ({ request }) => {
    const response = await request.post('/produtos', {
      data: {
        nome: randomProductName(),
        preco: 100,
        descricao: 'Produto de teste sem autenticação',
        quantidade: 10,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toMatch(/token de acesso ausente/i);
  });

  test('cadastro de produto com token de usuário comum retorna 403', async ({ request }) => {
    const token = await criarUsuarioEObterToken(request, 'false');

    const response = await request.post('/produtos', {
      headers: { Authorization: token },
      data: {
        nome: randomProductName(),
        preco: 100,
        descricao: 'Produto de teste com usuário comum',
        quantidade: 10,
      },
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.message).toMatch(/rota exclusiva para administradores/i);
  });

  test('cadastro de produto com token de administrador retorna 201', async ({ request }) => {
    const token = await criarUsuarioEObterToken(request, 'true');

    const response = await request.post('/produtos', {
      headers: { Authorization: token },
      data: {
        nome: randomProductName(),
        preco: 100,
        descricao: 'Produto de teste com administrador',
        quantidade: 10,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('_id');
  });
});

test.describe('Validação de contrato', () => {
  test('GET /produtos retorna schema esperado (campos e tipos)', async ({ request }) => {
    const response = await request.get('/produtos');
    expect(response.status()).toBe(200);

    const body = await response.json();

   
    expect(body).toHaveProperty('quantidade');
    expect(typeof body.quantidade).toBe('number');
    expect(body).toHaveProperty('produtos');
    expect(Array.isArray(body.produtos)).toBe(true);

    
    expect(body.produtos.length).toBeGreaterThan(0);
    const produto = body.produtos[0];

    expect(typeof produto._id).toBe('string');
    expect(typeof produto.nome).toBe('string');
    expect(typeof produto.preco).toBe('number');
    expect(typeof produto.descricao).toBe('string');
    expect(typeof produto.quantidade).toBe('number');
  });
});
