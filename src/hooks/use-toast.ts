import { useCallback } from "react";
import { toast as shadcnToast } from "@/components/ui/use-toast";

/**
 * Hook customizado para facilitar o uso do toast global.
 */
export function useToast() {
  return useCallback(
    ({
      title,
      description,
      variant = "default",
      duration = 4000,
    }: {
      title: string;
      description?: string;
      variant?: "default" | "destructive" | "success" | "info";
      duration?: number;
    }) => {
      shadcnToast({
        title,
        description,
        variant,
        duration,
      });
    },
    []
  );
}

// Exporta também a função toast para uso direto (sem hook)
export const toast = ({
  title,
  description,
  variant = "default",
  duration = 4000,
}: {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "info";
  duration?: number;
}) => {
  shadcnToast({
    title,
    description,
    variant,
    duration,
  });
};