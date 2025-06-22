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
    console.log('Buscando pacientes vinculados ao psicólogo diretamente da tabela user_profiles');
    
    // Buscar pacientes diretamente da tabela user_profiles usando o campo psychologist_id
    const { data: patientsData, error: patientsError } = await supabaseAny
      .from('user_profiles')
      .select('id, user_id, full_name, email, psychologist_id')
      .eq('psychologist_id', psychologistId);

    if (patientsError) {
      console.error('Erro ao buscar pacientes da tabela user_profiles:', patientsError);
      throw patientsError;
    }

    if (!patientsData || patientsData.length === 0) {
      console.log('Nenhum paciente encontrado com psychologist_id =', psychologistId);
      return [];
    }

    console.log('Pacientes encontrados na tabela user_profiles:', patientsData.length);
    
    // Buscar associações na tabela psychologists_patients para obter informações adicionais
    const patientIds = patientsData.map((patient: any) => patient.user_id);
    const { data: associations, error: associationsError } = await supabaseAny
      .from('psychologists_patients')
      .select('*')
      .eq('psychologist_id', psychologistId)
      .eq('status', 'active')
      .is('ended_at', null)
      .in('patient_id', patientIds);
      
    if (associationsError) {
      console.warn('Aviso: Erro ao buscar associações da tabela psychologists_patients:', associationsError);
    }
    
    // Criar um mapa de associações para fácil acesso
    const associationsMap = new Map();
    if (associations && associations.length > 0) {
      associations.forEach((assoc: any) => {
        associationsMap.set(assoc.patient_id, assoc);
      });
    }

    // Mapear os dados para o formato esperado
    return patientsData.map((patient: any) => {
      const association = associationsMap.get(patient.user_id);
      
      return {
        id: association?.id || `user_profile_${patient.id}`,
        psychologist_id: psychologistId,
        patient_id: patient.user_id,
        started_at: association?.started_at || new Date().toISOString(),
        ended_at: null,
        status: 'active',
        patient_name: patient.full_name,
        patient_email: patient.email,
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
    console.log('Iniciando desvinculação com patientId:', patientId, 'psychologistId:', psychologistId);
    
    // Buscar o email do paciente para limpeza de convites
    let patientEmail = '';
    const { data: userProfile, error: profileError } = await supabaseAny
      .from('user_profiles')
      .select('user_id, email')
      .eq('user_id', patientId)
      .maybeSingle();
      
    if (!profileError && userProfile) {
      patientEmail = userProfile.email;
    } else {
      // Se não encontrou por user_id, tentar por id
      const { data: userProfileById, error: profileError2 } = await supabaseAny
        .from('user_profiles')
        .select('user_id, email')
        .eq('id', patientId)
        .maybeSingle();
        
      if (!profileError2 && userProfileById) {
        patientEmail = userProfileById.email;
        patientId = userProfileById.user_id; // Atualizar patientId para user_id correto
      }
    }
    
    // Buscar a associação ativa
    const { data: association, error: findError } = await supabaseAny
      .from('psychologists_patients')
      .select('id, patient_id, psychologist_id, status')
      .eq('patient_id', patientId)
      .eq('psychologist_id', psychologistId)
      .eq('status', 'active')
      .is('ended_at', null)
      .maybeSingle();

    if (findError) {
      console.error('Erro ao buscar associação:', findError);
      throw findError;
    }

    // Se não encontrou associação ativa, tentar buscar por user_id na tabela user_profiles
    if (!association) {
      console.log('Associação não encontrada diretamente. Tentando buscar user_id na tabela user_profiles...');
      
      // Buscar o user_id correspondente ao ID do perfil
      const { data: userProfile, error: profileError } = await supabaseAny
        .from('user_profiles')
        .select('user_id')
        .eq('id', patientId)
        .maybeSingle();
        
      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        throw profileError;
      }
      
      if (!userProfile || !userProfile.user_id) {
        console.log('Perfil de usuário não encontrado ou sem user_id. Desvinculação não é possível.');
        return;
      }
      
      console.log('Encontrado user_id:', userProfile.user_id, 'para o perfil ID:', patientId);
      
      // Tentar novamente com o user_id encontrado
      const { data: associationByUserId, error: findError2 } = await supabaseAny
        .from('psychologists_patients')
        .select('id, patient_id, psychologist_id, status')
        .eq('patient_id', userProfile.user_id)
        .eq('psychologist_id', psychologistId)
        .eq('status', 'active')
        .is('ended_at', null)
        .maybeSingle();
        
      if (findError2) {
        console.error('Erro ao buscar associação com user_id:', findError2);
        throw findError2;
      }
      
      if (!associationByUserId) {
        console.log('Nenhuma associação encontrada mesmo usando user_id. Desvinculação não é possível.');
        return;
      }
      
      console.log('Associação encontrada usando user_id:', associationByUserId);
      
      // Atualizar a associação para inativa
      const { error } = await supabaseAny
        .from('psychologists_patients')
        .update({
          status: 'inactive',
          ended_at: new Date().toISOString()
        })
        .eq('id', associationByUserId.id);

      if (error) {
        console.error('Erro ao atualizar associação com user_id:', error);
        throw error;
      }
      
      console.log('Paciente desvinculado com sucesso usando user_id!');
      
      // 🔥 SOLUÇÃO: Deletar todos os convites relacionados
      if (patientEmail) {
        console.log('Limpando convites relacionados para:', patientEmail);
        const { error: deleteInvitesError } = await supabaseAny
          .from('psychologists_patients')
          .delete()
          .eq('psychologist_id', psychologistId)
          .eq('patient_email', patientEmail);
          
        if (deleteInvitesError) {
          console.error('Aviso: Erro ao deletar convites:', deleteInvitesError);
        } else {
          console.log('Convites relacionados deletados com sucesso!');
        }
      }
      
      return;
    }

    console.log('Associação encontrada:', association);
    
    // Atualizar a associação para inativa
    const { error } = await supabaseAny
      .from('psychologists_patients')
      .update({
        status: 'inactive',
        ended_at: new Date().toISOString()
      })
      .eq('id', association.id);

    if (error) {
      console.error('Erro ao atualizar associação:', error);
      throw error;
    }
    
    console.log('Paciente desvinculado com sucesso!');
    
    // Também atualizar o campo psychologist_id na tabela user_profiles para null
    const { error: updateProfileError } = await supabaseAny
      .from('user_profiles')
      .update({
        psychologist_id: null
      })
      .eq('user_id', patientId);
      
    if (updateProfileError) {
      console.error('Aviso: Não foi possível atualizar o perfil do usuário, mas a desvinculação foi concluída:', updateProfileError);
    } else {
      console.log('Perfil do usuário atualizado com sucesso!');
    }
    
    // 🔥 SOLUÇÃO: Deletar todos os convites relacionados
    if (patientEmail) {
      console.log('Limpando convites relacionados para:', patientEmail);
      const { error: deleteInvitesError } = await supabaseAny
        .from('psychologists_patients')
        .delete()
        .eq('psychologist_id', psychologistId)
        .eq('patient_email', patientEmail);
        
      if (deleteInvitesError) {
        console.error('Aviso: Erro ao deletar convites:', deleteInvitesError);
      } else {
        console.log('Convites relacionados deletados com sucesso!');
      }
    }
    
  } catch (error) {
    console.error('Erro ao desassociar paciente do psicólogo:', error);
    throw error;
  }
};

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

/**
 * Cancela um convite pendente enviado a um paciente
 * @param connectionId ID da conexão pendente
 * @param psychologistId ID do psicólogo
 */
export const cancelPendingInvite = async (connectionId: string, psychologistId: string): Promise<void> => {
  try {
    console.log('Cancelando convite pendente:', connectionId);
    
    // 🔥 SOLUÇÃO: Deletar o convite ao invés de apenas marcar como cancelado
    const { error } = await supabaseAny
      .from('psychologists_patients')
      .delete()
      .eq('id', connectionId)
      .eq('psychologist_id', psychologistId)
      .eq('status', 'pending');
      
    if (error) {
      console.error('Erro ao cancelar convite:', error);
      throw error;
    }
    
    console.log('Convite deletado com sucesso!');
  } catch (error) {
    console.error('Erro ao cancelar convite pendente:', error);
    throw error;
  }
};

/**
 * Convida um paciente para se conectar com um psicólogo
 * @param psychologistId ID do psicólogo
 * @param patientEmail Email do paciente
 * @returns ID da conexão criada
 */
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
    
    // 🔥 SOLUÇÃO: Verificar se já existe uma conexão (buscar todas e filtrar)
    const { data: existingConnections, error: connectionError } = await supabaseAny
      .from('psychologists_patients')
      .select('id, status')
      .eq('psychologist_id', psychologistId)
      .eq('patient_id', patient.user_id)
      .order('started_at', { ascending: false });
      
    if (connectionError) {
      console.error('Erro ao verificar conexão existente:', connectionError);
      throw connectionError;
    }
    
    // Verificar se há conexão ativa
    const activeConnection = existingConnections?.find(conn => conn.status === 'active');
    if (activeConnection) {
      throw new Error('Este paciente já está conectado a você');
    }
    
    // Verificar se há conexão pendente
    const pendingConnection = existingConnections?.find(conn => conn.status === 'pending');
    if (pendingConnection) {
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
