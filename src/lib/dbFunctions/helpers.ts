import { format } from 'date-fns';

// Helper function to format date safely
export const formatDateOrNull = (date: Date | null): string | null => {
  return date ? format(date, 'yyyy-MM-dd') : null;
};
