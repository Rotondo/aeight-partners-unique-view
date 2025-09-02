
// Utility functions for file handling
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    // Remove acentos e caracteres especiais
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Substitui espaços por underscores
    .replace(/\s+/g, '_')
    // Remove caracteres não alfanuméricos exceto pontos, hífens e underscores
    .replace(/[^a-zA-Z0-9._-]/g, '')
    // Remove múltiplos underscores seguidos
    .replace(/_+/g, '_')
    // Remove underscores no início e fim
    .replace(/^_+|_+$/g, '');
};

export const validateFileName = (fileName: string): { isValid: boolean; error?: string } => {
  if (!fileName) {
    return { isValid: false, error: 'Nome do arquivo não pode estar vazio' };
  }

  if (fileName.length > 100) {
    return { isValid: false, error: 'Nome do arquivo muito longo (máximo 100 caracteres)' };
  }

  // Verifica se contém caracteres especiais problemáticos
  // eslint-disable-next-line no-control-regex
  const invalidChars = /[<>:"/\\|?*\u0000-\u001f]/;
  if (invalidChars.test(fileName)) {
    return { isValid: false, error: 'Nome do arquivo contém caracteres inválidos' };
  }

  return { isValid: true };
};
