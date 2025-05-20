
import { format } from 'date-fns';

export const formatDate = (dateString?: string) => {
  if (!dateString) return 'Não disponível';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return 'Data inválida';
  }
};
