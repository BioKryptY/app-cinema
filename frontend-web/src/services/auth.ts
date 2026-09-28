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
