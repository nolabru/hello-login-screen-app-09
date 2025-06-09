import { supabase } from './client';

// Usando any para o tipo do Supabase para contornar erros de tipo
const supabaseAny: any = supabase;

// Tipo para representar um paciente associado a um psicólogo
export interface PsychologistPatient {
  id: string;
  psychologist_id: string;
  patient_id: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  patient_name?: string;
  patient_email?: string;
}

/**
 * Aceita uma solicitação de conexão de um paciente
 * @param patientId ID do paciente
 * @param psychologistId ID do psicólogo
 * @param connectionId ID da conexão
 */
export const acceptPatientRequest = async (patientId: string, psychologistId: string, connectionId: string): Promise<void> => {
  try {
    // Atualizar o status da conexão para ativo
    const { error } = await supabaseAny
      .from('psychologists_patients')
      .update({
        status: 'active'
      })
      .eq('id', connectionId)
      .eq('psychologist_id', psychologistId)
      .eq('patient_id', patientId);
      
    if (error) throw error;
    
  } catch (error) {
    console.error('Erro ao aceitar solicitação de paciente:', error);
    throw error;
  }
};

/**
 * Rejeita uma solicitação de conexão de um paciente
 * @param patientId ID do paciente
 * @param psychologistId ID do psicólogo
 * @param connectionId ID da conexão
 */
export const rejectPatientRequest = async (patientId: string, psychologistId: string, connectionId: string): Promise<void> => {
  try {
    // Atualizar o status da conexão para rejeitado
    const { error } = await supabaseAny
      .from('psychologists_patients')
      .update({
        status: 'rejected',
        ended_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .eq('psychologist_id', psychologistId)
      .eq('patient_id', patientId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao rejeitar solicitação de paciente:', error);
    throw error;
  }
};

/**
 * Busca todos os pacientes associados a um psicólogo
 * @param psychologistId ID do psicólogo
 * @returns Lista de pacientes associados ao psicólogo
 */
export const fetchPsychologistPatients = async (psychologistId: string): Promise<PsychologistPatient[]> => {
  try {
    // Buscar associações entre psicólogo e pacientes
    const { data, error } = await supabaseAny
      .from('psychologists_patients')
      .select('*')
      .eq('psychologist_id', psychologistId)
      .eq('status', 'active')
      .is('ended_at', null);

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    // Buscar detalhes dos pacientes
    const patientIds = data.map((item: any) => item.patient_id);
    const { data: patientsData, error: patientsError } = await supabaseAny
      .from('user_profiles')
      .select('user_id, name, email')
      .in('user_id', patientIds);

    if (patientsError) throw patientsError;

    // Mapear os dados para o formato esperado
    return data.map((item: any) => {
      const patient = patientsData?.find((p: any) => p.user_id === item.patient_id);
      return {
        id: item.id,
        psychologist_id: item.psychologist_id,
        patient_id: item.patient_id,
        started_at: item.started_at,
        ended_at: item.ended_at,
        status: item.status,
        patient_name: patient?.name,
        patient_email: patient?.email,
      };
    });
  } catch (error) {
    console.error('Erro ao buscar pacientes do psicólogo:', error);
    throw error;
  }
};

/**
 * Desassocia um paciente de um psicólogo
 * @param patientId ID do paciente
 * @param psychologistId ID do psicólogo
 */
export const disassociatePatientFromPsychologist = async (patientId: string, psychologistId: string): Promise<void> => {
  try {
    // Buscar a associação ativa
    const { data: association, error: findError } = await supabaseAny
      .from('psychologists_patients')
      .select('id')
      .eq('patient_id', patientId)
      .eq('psychologist_id', psychologistId)
      .eq('status', 'active')
      .is('ended_at', null)
      .maybeSingle();

    if (findError) throw findError;

    // Se não encontrou associação ativa, não há o que fazer
    if (!association) {
      return;
    }

    // Atualizar a associação para inativa
    const { error } = await supabaseAny
      .from('psychologists_patients')
      .update({
        status: 'inactive',
        ended_at: new Date().toISOString()
      })
      .eq('id', association.id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao desassociar paciente do psicólogo:', error);
    throw error;
  }
};
