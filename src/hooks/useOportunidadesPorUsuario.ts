import { useMemo } from "react";
import { Oportunidade, Usuario } from "@/types";

interface OportunidadesUsuario {
  usuarioId: string;
  usuarioNome: string;
  enviadas: number;
  recebidas: number;
}

export function useOportunidadesPorUsuario(
  oportunidadesFiltradas: Oportunidade[],
  usuarios: Usuario[]
): OportunidadesUsuario[] {
  return useMemo(() => {
    return usuarios.map((usuario) => {
      const enviadas = oportunidadesFiltradas.filter(
        (op) => op.usuario_origem_id === usuario.id
      ).length;
      const recebidas = oportunidadesFiltradas.filter(
        (op) => op.usuario_destino_id === usuario.id
      ).length;
      return {
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        enviadas,
        recebidas,
      };
    });
  }, [oportunidadesFiltradas, usuarios]);
}
