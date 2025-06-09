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
    
    // Atualizar o campo psychologist_id na tabela user_profiles
    console.log(`Atualizando user_profiles: definindo psychologist_id=${psychologistId} para user_id=${patientId}`);
    const { error: updateError } = await supabaseAny
      .from('user_profiles')
      .update({
        psychologist_id: psychologistId
      })
      .eq('user_id', patientId);
      
    if (updateError) {
      console.error('Erro ao atualizar psychologist_id no perfil do usuário:', updateError);
      throw updateError;
    }
    
    console.log('Conexão aceita com sucesso, disparando evento patientConnectionUpdated');
    
    // Disparar evento para atualizar a lista de pacientes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('patientConnectionUpdated'));
    }
    
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

/**
 * Convida um paciente para se conectar com um psicólogo
 * @param psychologistId ID do psicólogo
 * @param patientEmail Email do paciente
 * @returns ID da conexão criada
 */
/**
 * Busca pacientes com convites pendentes enviados pelo psicólogo
 * @param psychologistId ID do psicólogo
 * @returns Lista de pacientes com convites pendentes
 */
export const fetchPendingInvites = async (psychologistId: string): Promise<any[]> => {
  try {
    // Buscar conexões pendentes iniciadas pelo psicólogo
    const { data, error } = await supabaseAny
      .from('psychologists_patients')
      .select('*')
      .eq('psychologist_id', psychologistId)
      .eq('status', 'pending')
      .not('patient_email', 'is', null);  // Apenas convites enviados pelo psicólogo
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Buscar detalhes dos pacientes
    const patientIds = data.map((item: any) => item.patient_id);
    const { data: patientsData, error: patientsError } = await supabaseAny
      .from('user_profiles')
      .select('*')
      .in('user_id', patientIds);
      
    if (patientsError) throw patientsError;
    
    // Combinar dados da conexão com dados do paciente
    return data.map((connection: any) => {
      const patientProfile = patientsData?.find((p: any) => p.user_id === connection.patient_id) || {};
      
      return {
        ...patientProfile,
        connection_id: connection.id,
        connection_status: connection.status,
        patient_email: connection.patient_email,
        created_at: connection.started_at
      };
    });
  } catch (error) {
    console.error('Erro ao buscar convites pendentes:', error);
    throw error;
  }
};

export const invitePatient = async (psychologistId: string, patientEmail: string): Promise<string> => {
  try {
    // Buscar o paciente pelo email
    const { data: patient, error: patientError } = await supabaseAny
      .from('user_profiles')
      .select('user_id')
      .eq('email', patientEmail)
      .single();
      
    if (patientError) {
      console.error('Erro ao buscar paciente:', patientError);
      throw new Error('Paciente não encontrado com este email');
    }
    
    if (!patient || !patient.user_id) {
      throw new Error('Paciente não encontrado com este email');
    }
    
    console.log('Paciente encontrado:', patient);
    
    // Verificar se já existe uma conexão
    const { data: existingConnection, error: connectionError } = await supabaseAny
      .from('psychologists_patients')
      .select('id, status')
      .eq('psychologist_id', psychologistId)
      .eq('patient_id', patient.user_id)
      .maybeSingle();
      
    if (connectionError) {
      console.error('Erro ao verificar conexão existente:', connectionError);
      throw connectionError;
    }
    
    // Se já existe uma conexão ativa, não fazer nada
    if (existingConnection && existingConnection.status === 'active') {
      throw new Error('Este paciente já está conectado a você');
    }
    
    // Se existe uma conexão pendente, não criar outra
    if (existingConnection && existingConnection.status === 'pending') {
      throw new Error('Já existe um convite pendente para este paciente');
    }
    
    console.log('Criando nova conexão entre psicólogo', psychologistId, 'e paciente', patient.user_id);
    
    // Criar nova conexão com status pendente
    const { data, error } = await supabaseAny
      .from('psychologists_patients')
      .insert({
        psychologist_id: psychologistId,
        patient_id: patient.user_id,
        status: 'pending',
        patient_email: patientEmail    // Armazenar o email do paciente para o app buscar
      });
      
    if (error) {
      console.error('Erro ao criar conexão:', error);
      throw error;
    }
    
    // Buscar o ID da conexão recém-criada
    const { data: newConnection, error: fetchError } = await supabaseAny
      .from('psychologists_patients')
      .select('id')
      .eq('psychologist_id', psychologistId)
      .eq('patient_id', patient.user_id)
      .eq('status', 'pending')
      .eq('patient_email', patientEmail)
      .order('started_at', { ascending: false })
      .limit(1);
      
    if (fetchError) {
      console.error('Erro ao buscar conexão criada:', fetchError);
      throw fetchError;
    }
    
    if (!newConnection || newConnection.length === 0) {
      throw new Error('Não foi possível encontrar a conexão criada');
    }
    
    console.log('Conexão criada com sucesso:', newConnection[0]);
    
    return newConnection[0].id;
    
  } catch (error) {
    console.error('Erro ao convidar paciente:', error);
    throw error;
  }
};
