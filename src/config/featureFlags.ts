// Feature flags centralizados (desligados por padrão)
// Nenhuma escrita em "oportunidades" ocorrerá sem habilitar explicitamente aqui (ou futuramente via UI/Admin)

export const features = {
  wishlistOpportunitySync: {
    // Controle mestre: criação automática de oportunidade a partir de apresentações
    enabled: false as boolean,
    // Data/hora (ISO) a partir da qual o recurso passa a valer (se enabled = true)
    // Se null/undefined, não aplica recorte temporal adicional
    startAt: null as string | null,

    // Somente cria oportunidade quando a fase atingir "apresentado"
    createOnPresented: true as boolean,

    // Sincronismo reverso (Oportunidades -> Wishlist) ficará OFF inicialmente
    backSyncStatusEnabled: false as boolean,
  },
};
