
// Constantes globais da aplicação
export const APP_NAME = "A&eight Partners";
export const APP_VERSION = "2.0.0";

// URLs e configurações do Supabase
export const SUPABASE_URL = "https://amuadbftctnmckncgeua.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtdWFkYmZ0Y3RubWNrbmNnZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDAyNTIsImV4cCI6MjA2MzMxNjI1Mn0.sx8PDd0vlbt4nQRQfdK6hOuEFbmGVQjD4RJcuU2okxM";

// Storage buckets
export const STORAGE_BUCKETS = {
  ONEPAGERS: 'onepagers',
  MATERIAIS: 'materiais',
  REPOSITORIO: 'repositorio'
} as const;

// URLs dos buckets (para o MaterialPreviewModal)
export const BUCKET_URL = `${SUPABASE_URL}/storage/v1/object/public`;

// Configurações de autenticação
export const AUTH_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  MAX_RETRIES: 3,
  SESSION_REFRESH_MARGIN: 60000 // 1 minuto antes de expirar
} as const;

// Status de oportunidades
export const OPORTUNIDADE_STATUS = {
  EM_CONTATO: 'em_contato',
  NEGOCIANDO: 'negociando',
  GANHO: 'ganho',
  PERDIDO: 'perdido'
} as const;

// Tipos de empresa
export const EMPRESA_TIPOS = {
  INTRAGRUPO: 'intragrupo',
  PARCEIRO: 'parceiro',
  CLIENTE: 'cliente'
} as const;

// Papéis de usuário
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
} as const;

// Configurações de cache
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  LONG_TTL: 30 * 60 * 1000,   // 30 minutos
  SHORT_TTL: 1 * 60 * 1000    // 1 minuto
} as const;

// Configurações de paginação
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MOBILE_PAGE_SIZE: 10
} as const;

// Breakpoints para responsividade
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1280
} as const;
