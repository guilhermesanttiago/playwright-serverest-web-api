# ServeRest Tests — Case Técnico Fidela (Parte C)

Suíte de testes automatizados (Web + API) para o [ServeRest](https://serverest.dev), feita como parte do case técnico de QA/Test Analyst da Fidela.

## Instalação

```bash
npm install
npx playwright install
```

Se o download dos navegadores do Playwright falhar (comum em redes corporativas), o projeto já está preparado para usar o Google Chrome instalado na máquina em vez do Chromium do Playwright: basta descomentar a linha `channel: 'chrome'` dentro do projeto `web` em `playwright.config.ts`.

## Execução — suíte completa em um único comando

```bash
npm test
```

Isso roda os dois projetos configurados (`web` e `api`) e gera automaticamente um relatório HTML.

Para rodar só uma parte:

```bash
npm run test:web
npm run test:api
```

## Ver o relatório da última execução

```bash
npm run report
```

Abre o relatório HTML gerado pelo Playwright (pasta `playwright-report/`), com timestamp da execução, passos, screenshots de falha e trace.

> O relatório da execução mais recente que rodei localmente está anexado/publicado conforme indicado no documento principal do case (`teste-qa-guilherme-santiago.md`).

## Estrutura do projeto

```
serverest-tests/
├── pages/                  # Page Objects (camada web)
│   ├── LoginPage.ts
│   └── HomePage.ts
├── tests/
│   ├── web/
│   │   └── login.spec.ts   # login (sucesso, senha inválida, campo vazio) + fluxo funcional
│   └── api/
│       ├── usuarios.spec.ts
│       ├── login.spec.ts
│       └── produtos.spec.ts
├── .github/workflows/tests.yml  # pipeline de CI (GitHub Actions)
├── playwright.config.ts
└── package.json
```

## Decisões tomadas

### Ferramenta
Playwright com TypeScript, conforme recomendação do enunciado. Usei o módulo de requisições nativo do Playwright (`request`) para a Parte C2, em vez de Postman/Newman, para manter a suíte inteira (web + API) num único comando de execução e num único relatório — reduz fricção de setup e mantém tudo no mesmo pipeline de CI.

### Origem dos dados de teste
O ambiente online do ServeRest é compartilhado entre candidatos/usuários e apaga os dados diariamente. Por isso:
- Todo teste gera seus próprios dados a cada execução, com e-mails únicos (`Date.now()` + número aleatório), nunca dependendo de um usuário pré-cadastrado.
- Nos testes web, o usuário usado no login é criado **via API** no `beforeAll`, antes da suíte web rodar — evita depender da própria UI de cadastro (que não faz parte do escopo pedido) só para preparar massa, e torna a suíte independente e repetível.

### Fluxo funcional escolhido após o login (C1)
Escolhi **adicionar um produto ao carrinho**. Justificativa: é a jornada de negócio central da aplicação (equivalente, em espírito, ao fluxo de "compra" do case Viva+ descrito nas Partes A/B), depende diretamente do login ter funcionado corretamente, e cobre em um único cenário: autenticação, navegação pós-login e interação com dado real vindo da API de produtos.

### Organização em Page Objects
A camada web usa Page Object Model (`LoginPage`, `HomePage`) para isolar seletores da lógica de teste, facilitando manutenção caso o front-end mude.

### Seletores da camada web — validados com Codegen
Os seletores de login (`email`, `senha`, `entrar`) e do fluxo pós-login (`adicionarNaLista`) foram confirmados executando `npx playwright codegen https://front.serverest.dev/login` contra a aplicação real, com um usuário criado na hora. O fluxo de "adicionar produto" navega automaticamente para `/minhaListaDeProdutos`, por isso o teste valida a URL de destino e o total exibido na tela, em vez de um contador na própria Home (ajuste feito depois da gravação real — a suposição inicial, de um badge na Home, não correspondia ao comportamento verdadeiro da aplicação).

### Validação de contrato (C2)
Feita sobre `GET /produtos`, verificando tanto a estrutura de topo (`quantidade`, `produtos` como array) quanto o tipo de cada campo do primeiro item da lista (`_id`, `nome`, `preco`, `descricao`, `quantidade`), evitando testes frágeis que dependam de um produto específico existir.

### CI
Workflow de GitHub Actions (`.github/workflows/tests.yml`) roda a suíte completa a cada push/PR na branch `main`, e publica o relatório HTML como artefato do job — permite consultar qualquer execução passada direto pela aba Actions do repositório, sem depender de anexo manual.

### Credenciais
Nenhuma credencial real é usada — todos os usuários são de teste, criados dinamicamente. O único "segredo" (senha de teste) está em texto plano no código porque é uma senha fictícia sem valor sensível, própria do ambiente de testes público do ServeRest.
