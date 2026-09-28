# Guia: integrar o frontend do CineWeb com o backend NestJS

> ✅ **Todos os passos deste guia já foram aplicados no projeto.** O guia fica como explicação do que foi feito e do porquê. Para usar, siga o passo 1 (rodar os dois e criar o usuário) e depois o passo 9 (testar).

Hoje o frontend conversa com o **json-server** (o arquivo `db.json`). A ideia é trocar isso pelo backend NestJS, que já tem todas as rotas com os mesmos nomes (veja o `backend/GUIA-CRUD.md`).

A boa notícia: como as rotas têm os mesmos nomes, **as telas quase não mudam**. O trabalho é:

1. deixar o backend aceitar chamadas do frontend;
2. criar a tela de login e guardar o token;
3. mandar o token junto nas chamadas;
4. proteger no frontend as telas que precisam de login.

## Como fica o acesso

| Tela do frontend | Sem login | Com login |
|---|---|---|
| Início | vê | vê |
| Filmes, Salas, Lanches (listas) | vê a lista | vê e pode criar, editar, excluir |
| Sessões (lista) | vê a lista, sem a lotação e sem o botão de venda | vê tudo e pode vender |
| Formulários (novo / editar) | vai para o login | usa normalmente |
| Ingressos, Pedidos | vai para o login | usa normalmente |

Isso segue o backend: consultar filmes, salas, lanches e sessões é aberto. Criar, editar, excluir e tudo de ingressos e pedidos pede login.

---

## 1. Antes de começar

### 1.1 — Pare o json-server

O json-server e o backend usam **a mesma porta (3000)**. Os dois não podem rodar juntos.

- **Não use mais** `npm run servidor` nem `npm run iniciar` no frontend.
- Agora você roda assim, em dois terminais:

```bash
# Terminal 1, na pasta backend
npm run start:dev

# Terminal 2, na pasta frontend-web
npm run dev
```

O frontend abre em `http://localhost:5173` e o backend fica em `http://localhost:3000`.

O frontend já aponta para `http://localhost:3000` por padrão (veja `src/config/index.ts`). Só precisa mexer no `.env` do frontend se você mudou a porta do backend.

### 1.2 — Crie um usuário

O frontend não tem tela de cadastro de usuário. Crie um pelo Swagger (`http://localhost:3000/api`), em **`POST /users`**. É com esse e-mail e senha que você vai entrar no frontend.

> Os dados que estavam no `db.json` **não passam** para o banco. Você começa com o banco vazio e cadastra tudo de novo pelas telas.

---

## 2. Backend: liberar o frontend (CORS)

> ✅ **Já aplicado** no `backend/src/main.ts`. Esta seção fica só para explicar o que foi feito.

O navegador bloqueia um site (`localhost:5173`) que tenta chamar outro endereço (`localhost:3000`), a não ser que o backend diga que aceita. Isso se chama **CORS**.

Sem esse passo, as telas mostram "Erro ao carregar..." e o console do navegador (F12) mostra `blocked by CORS policy`.

No **`backend/src/main.ts`**, logo depois do `ValidationPipe`:

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

// Deixa o frontend (Vite, porta 5173) chamar esta API
app.enableCors({ origin: 'http://localhost:5173' });
```

> Use o endereço exato do frontend, não `'*'` (que libera qualquer site). Se um dia o frontend rodar em outro endereço, adicione ele aqui.

---

## 3. Frontend: guardar o token (`src/services/auth.ts`)

Crie o arquivo **`frontend-web/src/services/auth.ts`**. Ele cuida de tudo do login: fazer o login, guardar o token, pegar o token e apagar o token.

```ts
import { configuracao } from '../config';

// Nome da "gaveta" onde o token fica guardado no navegador
const CHAVE_TOKEN = 'cineweb_token';

export function pegarToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function salvarToken(token: string): void {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function removerToken(): void {
  localStorage.removeItem(CHAVE_TOKEN);
}

export function estaLogado(): boolean {
  return pegarToken() !== null;
}

// Manda e-mail e senha para o backend e guarda o token que volta
export async function fazerLogin(email: string, password: string): Promise<void> {
  const resposta = await fetch(`${configuracao.urlBaseApi}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!resposta.ok) {
    throw new Error('E-mail ou senha incorretos');
  }

  const dados: { access_token: string } = await resposta.json();
  salvarToken(dados.access_token);
}
```

**O que é o `localStorage`?** Um espaço do navegador que guarda textos mesmo depois de fechar a aba. Assim a pessoa não precisa fazer login toda vez que recarrega a página.

> Guardar o token no `localStorage` é o jeito mais simples e serve bem para um trabalho de faculdade. Em sistema de verdade costuma-se usar um cookie especial, porque um script malicioso na página conseguiria ler o `localStorage`.

---

## 4. Frontend: mandar o token em toda chamada (`src/services/api.ts`)

Hoje cada função do `api.ts` chama o `fetch` direto. Vamos criar **uma função só**, que faz o `fetch` e já coloca o token. Assim não precisa repetir isso em 30 lugares.

### 4.1 — Adicione no topo do `api.ts`

Logo abaixo do `const URL_BASE_API = ...`:

```ts
import { pegarToken, removerToken } from './auth';

// Faz a chamada para o backend já com o token (se tiver)
async function chamarApi(caminho: string, opcoes: RequestInit = {}): Promise<Response> {
  const token = pegarToken();

  const resposta = await fetch(`${URL_BASE_API}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // 401 = sem login ou token vencido (dura 1 hora): apaga o token e manda para o login
  if (resposta.status === 401) {
    removerToken();
    window.location.href = '/login';
  }

  return resposta;
}
```

> O `import` vai junto dos outros imports, lá em cima do arquivo.

### 4.2 — Troque o `fetch` pelo `chamarApi` em todas as funções

Use o **Localizar e Substituir** do VS Code (`Ctrl + H`), **só neste arquivo**:

| Localizar | Substituir por |
|---|---|
| `` fetch(`${URL_BASE_API} `` | `` chamarApi(` `` |

Depois apague as linhas `headers: { 'Content-Type': 'application/json' },`, porque o `chamarApi` já coloca isso.

Antes e depois, para conferir:

```ts
// ANTES
export async function criarFilme(filme: Filme): Promise<Filme> {
  const resposta = await fetch(`${URL_BASE_API}/filmes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filme),
  });
  return tratarResposta<Filme>(resposta);
}

// DEPOIS
export async function criarFilme(filme: Filme): Promise<Filme> {
  const resposta = await chamarApi('/filmes', {
    method: 'POST',
    body: JSON.stringify(filme),
  });
  return tratarResposta<Filme>(resposta);
}
```

> ⚠️ **Não** faça essa troca dentro da própria função `chamarApi`: ela é a única que continua usando o `fetch` de verdade. Se ela virar `chamarApi(...)` chamando ela mesma, a página trava.

O resto do `api.ts` fica igual: os endereços (`/filmes`, `/ingressos?sessaoId=...`) já são os mesmos do backend.

---

## 5. Frontend: a tela de login (`src/pages/Login.tsx`)

Crie **`frontend-web/src/pages/Login.tsx`**, no mesmo estilo das outras telas (Bootstrap):

```tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { fazerLogin } from '../services/auth';
import AlertMessage from '../components/AlertMessage';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); // não deixa a página recarregar
    setError(null);

    try {
      setLoading(true);
      await fazerLogin(email, senha);
      navigate('/'); // deu certo: volta para o início
    } catch {
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: '420px' }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h1 className="h4 mb-4 d-flex align-items-center">
            <i className="bi bi-person-lock me-2" style={{ color: '#d4af37' }}></i>
            Entrar
          </h1>

          {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">E-mail</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="senha" className="form-label">Senha</label>
              <input
                id="senha"
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-warning w-100" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Frontend: proteger as telas que pedem login

### 6.1 — Crie `src/components/RotaProtegida.tsx`

Esse componente funciona como um porteiro: se a pessoa não fez login, manda para `/login`; se fez, mostra a tela.

```tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { estaLogado } from '../services/auth';

export default function RotaProtegida({ children }: { children: ReactNode }) {
  if (!estaLogado()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
```

### 6.2 — Use no `src/routes/index.tsx`

Adicione a rota `/login` e envolva com `<RotaProtegida>` os formulários, os ingressos e os pedidos:

```tsx
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Filmes from '../pages/Filmes';
import FilmeForm from '../pages/FilmeForm';
import Salas from '../pages/Salas';
import SalaForm from '../pages/SalaForm';
import Sessoes from '../pages/Sessoes';
import SessaoForm from '../pages/SessaoForm';
import Ingressos from '../pages/Ingressos';
import LanchesCombos from '../pages/LanchesCombos';
import LancheComboForm from '../pages/LancheComboForm';
import Pedidos from '../pages/Pedidos';
import RotaProtegida from '../components/RotaProtegida';

function AppRoutes() {
  return (
    <Routes>
      {/* Abertas: qualquer pessoa vê */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/filmes" element={<Filmes />} />
      <Route path="/salas" element={<Salas />} />
      <Route path="/sessoes" element={<Sessoes />} />
      <Route path="/lanches-combos" element={<LanchesCombos />} />

      {/* Só com login */}
      <Route path="/filmes/novo" element={<RotaProtegida><FilmeForm /></RotaProtegida>} />
      <Route path="/filmes/editar/:id" element={<RotaProtegida><FilmeForm /></RotaProtegida>} />
      <Route path="/salas/nova" element={<RotaProtegida><SalaForm /></RotaProtegida>} />
      <Route path="/salas/editar/:id" element={<RotaProtegida><SalaForm /></RotaProtegida>} />
      <Route path="/sessoes/nova" element={<RotaProtegida><SessaoForm /></RotaProtegida>} />
      <Route path="/sessoes/editar/:id" element={<RotaProtegida><SessaoForm /></RotaProtegida>} />
      <Route path="/lanches-combos/novo" element={<RotaProtegida><LancheComboForm /></RotaProtegida>} />
      <Route path="/lanches-combos/editar/:id" element={<RotaProtegida><LancheComboForm /></RotaProtegida>} />
      <Route path="/ingressos" element={<RotaProtegida><Ingressos /></RotaProtegida>} />
      <Route path="/pedidos" element={<RotaProtegida><Pedidos /></RotaProtegida>} />
    </Routes>
  );
}

export default AppRoutes;
```

> **E os botões de excluir nas listas abertas?** Se alguém sem login clicar em excluir um filme, o backend responde 401 e o `chamarApi` (passo 4) manda a pessoa para o login. Nada é apagado. Se quiser esconder esses botões de quem não fez login, use `estaLogado()` em volta deles, igual ao passo 8.

---

## 7. Frontend: botão Entrar / Sair na barra (`src/components/Navbar.tsx`)

### 7.1 — No topo do arquivo

```tsx
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { estaLogado, removerToken } from '../services/auth';

export default function Navbar() {
  useLocation(); // faz a barra se atualizar a cada troca de página (ex.: logo depois do login)
  const navigate = useNavigate();
  const logado = estaLogado();

  function sair() {
    removerToken();
    navigate('/login');
  }

  return (
    // ... o resto continua igual
```

### 7.2 — Novo item no fim da lista

Depois do último `<li>` (o de Pedidos), antes do `</ul>`:

```tsx
<li className="nav-item d-flex align-items-center ms-lg-2 mt-2 mt-lg-0">
  {logado ? (
    <button className="btn btn-outline-light btn-sm" onClick={sair}>
      <i className="bi bi-box-arrow-right me-1"></i>
      Sair
    </button>
  ) : (
    <NavLink className="btn btn-warning btn-sm" to="/login">
      <i className="bi bi-box-arrow-in-right me-1"></i>
      Entrar
    </NavLink>
  )}
</li>
```

---

## 8. Frontend: ajuste na tela de Sessões (`src/pages/Sessoes.tsx`)

A tela de Sessões é aberta, mas ela busca os **ingressos** de cada sessão para mostrar a lotação, e ingressos pedem login. Sem esse ajuste, quem não fez login cairia direto na tela de login ao abrir Sessões.

A regra fica: **só busca os ingressos se estiver logado**. Quem não está logado vê as sessões, mas sem a lotação e sem o botão de venda.

### 8.1 — Import

```tsx
import { estaLogado } from '../services/auth';
```

### 8.2 — Dentro da função `Sessoes`, logo no começo

```tsx
export default function Sessoes() {
  const logado = estaLogado();
  // ... os useState continuam iguais
```

### 8.3 — No `loadData`, troque a linha que busca os ingressos

```tsx
// ANTES
const ingressos = await buscarIngressosPorSessao(sessao.id!);

// DEPOIS: sem login não busca (daria 401)
const ingressos = estaLogado() ? await buscarIngressosPorSessao(sessao.id!) : [];
```

> Aqui usamos `estaLogado()` direto, e não a variável `logado`. O `loadData` roda dentro do `useEffect`, e usar uma variável da tela ali faz o lint reclamar (`react-hooks/exhaustive-deps`).

### 8.4 — Na coluna "Ingressos" da tabela

Envolva o bloco da lotação para mostrar um traço para quem não está logado:

```tsx
<td className="text-center">
  {logado ? (
    <div className="d-flex flex-column align-items-center">
      {/* ... o conteúdo que já existia (número e barrinha) ... */}
    </div>
  ) : (
    <span className="text-muted">—</span>
  )}
</td>
```

### 8.5 — No botão de vender, adicione `logado &&`

```tsx
{logado && !passada && sessao.ingressosVendidos! < (sessao.sala?.capacidade || 0) && (
  <button
    className="btn btn-success"
    // ... resto igual
```

---

## 9. Testar tudo

Com o backend e o frontend rodando (passo 1.1):

**Sem login:**
1. Abra `http://localhost:5173`. A barra mostra **Entrar**.
2. Abra Filmes, Salas, Lanches e Sessões: as listas carregam (vazias no começo).
3. Clique em **Novo Filme**: vai para a tela de login.
4. Tente abrir `http://localhost:5173/pedidos`: vai para a tela de login.

**Com login:**
5. Entre com o usuário criado no passo 1.2. A barra passa a mostrar **Sair**.
6. Cadastre, nesta ordem: uma sala, um filme, um lanche e uma sessão com data futura.
7. Em Sessões, venda ingressos com um lanche. Confira que aparecem em **Ingressos** e em **Pedidos**.
8. Edite um filme e uma sala. Cancele um ingresso. Exclua uma sessão com vendas.
9. Clique em **Sair**: volta para a vitrine sem login.

**Token vencido:** o token dura 1 hora. Depois disso, a primeira ação protegida manda para o login. Isso é esperado.

---

## 10. Problemas comuns

| O que aparece | Por quê | Como resolver |
|---|---|---|
| "Erro ao carregar..." em todas as telas e `blocked by CORS policy` no console (F12) | Faltou o passo 2, ou o endereço do frontend está diferente | Confira o `enableCors` e se o frontend abriu mesmo na porta 5173 |
| "Erro ao carregar..." e `Failed to fetch` no console | O backend não está rodando, ou o json-server está ocupando a porta 3000 | Feche o json-server e rode `npm run start:dev` no backend |
| Faz login e volta para a tela de login | O token não foi salvo, ou o `JWT_SECRET` do backend mudou | Veja no F12 → Application → Local Storage se existe `cineweb_token` |
| "Erro ao excluir filme" (ou sala) | Ainda existe sessão usando esse filme ou sala, e o banco não deixa apagar | Exclua as sessões dele antes. Com o json-server isso passava e deixava sessão "órfã"; agora o banco protege |
| "Erro ao salvar sala" com dados certos | Já existe uma sala com esse número (o número é único no banco) | Use outro número |
| A página trava ao carregar | O `chamarApi` ficou chamando ele mesmo (passo 4.2) | Dentro do `chamarApi` tem que ser `fetch(...)` |

---

## 11. Depois que tudo funcionar

- Pode apagar o `db.json` e os scripts `servidor` e `iniciar` do `package.json` do frontend, e desinstalar o json-server (`npm uninstall json-server concurrently`). Faça isso **só depois** de testar tudo.
- Sugestão de commits, um por mudança, adicionando por caminho:

```bash
git add backend/src/main.ts
git commit -m "feat(api): frontend do cinema passa a poder chamar a API"

git add backend/src/users/users.service.ts
git commit -m "fix(users): senha deixa de aparecer nas respostas e troca de senha volta a permitir login"

git add frontend-web/src/services/auth.ts frontend-web/src/services/api.ts frontend-web/src/pages/Login.tsx
git commit -m "feat(login): funcionário entra com e-mail e senha e o token vai em toda chamada"

git add frontend-web/src/components/RotaProtegida.tsx frontend-web/src/routes/index.tsx frontend-web/src/components/Navbar.tsx
git commit -m "feat(login): cadastro e vendas só abrem para quem fez login"

git add frontend-web/src/pages/Sessoes.tsx
git commit -m "feat(sessoes): visitante vê as sessões sem a lotação e sem o botão de venda"
```
