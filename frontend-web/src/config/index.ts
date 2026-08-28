// Configurações da aplicação carregadas do .env

export const configuracao = {
  // Nome da aplicação
  nomeAplicacao: import.meta.env.VITE_NOME_APLICACAO || 'CineWeb',

  // URL base da API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost',

  // Porta da API
  apiPorta: import.meta.env.VITE_API_PORTA || '3000',

  // URL completa da API
  get urlBaseApi(): string {
    return `${this.apiUrl}:${this.apiPorta}`;
  },
};
