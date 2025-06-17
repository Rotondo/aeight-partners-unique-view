
/**
 * Service para upload de arquivos
 */
export class FileUploadService {
  /**
   * Valida um arquivo de áudio
   */
  static validateAudioFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg'];

    if (file.size > maxSize) {
      return { isValid: false, error: 'Arquivo muito grande. Máximo 50MB.' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Tipo de arquivo não suportado.' };
    }

    return { isValid: true };
  }

  /**
   * Valida um arquivo de vídeo
   */
  static validateVideoFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/mov'];

    if (file.size > maxSize) {
      return { isValid: false, error: 'Arquivo muito grande. Máximo 100MB.' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Tipo de arquivo não suportado.' };
    }

    return { isValid: true };
  }

  /**
   * Simula upload de arquivo
   */
  static async uploadFile(file: File, type: 'audio' | 'video'): Promise<string | null> {
    // Mock - em produção faria upload real para Supabase Storage
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`mock-${type}-url-${Date.now()}`);
      }, 2000);
    });
  }
}
