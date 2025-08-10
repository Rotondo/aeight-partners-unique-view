
// Feature flags centralizados - ATIVADOS para sincronização Wishlist <-> Oportunidades
// A partir de agora, apresentações "apresentado" criam oportunidades automaticamente

export const features = {
  wishlistOpportunitySync: {
    // Controle mestre: criação automática de oportunidade a partir de apresentações
    enabled: true as boolean,
    // Data/hora (ISO) a partir da qual o recurso passa a valer (se enabled = true)
    // Se null/undefined, não aplica recorte temporal adicional
    startAt: null as string | null,

    // Somente cria oportunidade quando a fase atingir "apresentado"
    createOnPresented: true as boolean,

    // Sincronismo reverso (Oportunidades -> Wishlist) ATIVADO para melhor UX
    backSyncStatusEnabled: true as boolean,
  },
};
