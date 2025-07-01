
// Application constants
export const APP_CONFIG = {
  // Chart colors
  CHART_COLORS: {
    PRIMARY: "#0088fe",
    SECONDARY: "#00c49f", 
    SUCCESS: "#10b981",
    WARNING: "#f59e0b",
    DANGER: "#ef4444",
    PURPLE: "#8b5cf6"
  },
  
  // Default values
  DEFAULTS: {
    PAGINATION_LIMIT: 10,
    CHART_HEIGHT: 300,
    CARD_HEIGHT: 400
  },
  
  // Status mappings
  STATUS_COLORS: {
    em_contato: "#f59e0b",
    negociando: "#8b5cf6", 
    ganho: "#10b981",
    perdido: "#ef4444"
  }
} as const;

// API endpoints and external URLs
const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'amuadbftctnmckncgeua';
const STORAGE_BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public`;

export const EXTERNAL_URLS = {
  SUPABASE_DASHBOARD: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`,
  DOCUMENTATION: "https://docs.lovable.dev/",
  MATERIAIS_BUCKET_PUBLIC_URL: `${STORAGE_BASE_URL}/materiais/`, // Adicionada URL do bucket de materiais
} as const;

// Form validation constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  MIN_PASSWORD_LENGTH: 6
} as const;
