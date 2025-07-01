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

// Default UI settings
export const DEFAULTS = {
  CARD_HEIGHT: '400px',
  CHART_HEIGHT: '300px',
  TABLE_ROW_HEIGHT: '48px',
  PAGINATION_LIMIT: 10
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#0088fe',
  SECONDARY: '#00c49f',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  PURPLE: '#8b5cf6',
  INFO: '#2196f3'
} as const;

// Status color mappings
export const STATUS_COLORS = {
  em_contato: "#f59e0b",
  negociando: "#8b5cf6", 
  ganho: "#10b981",
  perdido: "#ef4444"
} as const;

// Main App Configuration Object
export const APP_CONFIG = {
  APP_NAME,
  APP_VERSION,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  STORAGE_BUCKETS,
  BUCKET_URL,
  AUTH_CONFIG,
  OPORTUNIDADE_STATUS,
  EMPRESA_TIPOS,
  USER_ROLES,
  CACHE_CONFIG,
  PAGINATION_CONFIG,
  BREAKPOINTS,
  DEFAULTS,
  CHART_COLORS
} as const;

// API endpoints and external URLs
const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'amuadbftctnmckncgeua';
const STORAGE_BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public`;

export const EXTERNAL_URLS = {
  SUPABASE_DASHBOARD: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`,
  DOCUMENTATION: "https://docs.lovable.dev/",
  MATERIAIS_BUCKET_PUBLIC_URL: `${STORAGE_BASE_URL}/materiais/`
} as const;

// Form validation constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  MIN_PASSWORD_LENGTH: 6
} as const;