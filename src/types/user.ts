
export interface UserProfile {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  status: boolean;
  phone: string | null;
  id_empresa: number | null;
  license_status: string | null;
}
