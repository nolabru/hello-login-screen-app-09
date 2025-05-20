
import { supabase } from './client';

export interface CompanyPsychologistAssociation {
  id?: number;
  id_empresa: number;
  id_psicologo: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const createCompanyPsychologistAssociation = async (association: CompanyPsychologistAssociation) => {
  const { data, error } = await supabase
    .from('company_psychologist_associations')
    .insert(association)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getCompanyPsychologists = async (companyId: number) => {
  // First get association IDs
  const { data: associations, error: associationsError } = await supabase
    .from('company_psychologist_associations')
    .select('id, id_psicologo, status')
    .eq('id_empresa', companyId);

  if (associationsError) {
    throw associationsError;
  }

  if (!associations || associations.length === 0) {
    return [];
  }

  // Extract psychologist IDs
  const psychologistIds = associations.map(assoc => assoc.id_psicologo);

  // Get psychologist details
  const { data: psychologists, error: psychologistsError } = await supabase
    .from('psychologists')
    .select('id, nome, email, crp, especialidade')
    .in('id', psychologistIds);

  if (psychologistsError) {
    throw psychologistsError;
  }

  // Map psychologists with their association status
  return psychologists.map(psychologist => {
    const association = associations.find(a => a.id_psicologo === psychologist.id);
    return {
      ...psychologist,
      status: association?.status || 'pending'
    };
  });
};

export const removeCompanyPsychologistAssociation = async (companyId: number, psychologistId: number) => {
  const { data, error } = await supabase
    .from('company_psychologist_associations')
    .delete()
    .eq('id_empresa', companyId)
    .eq('id_psicologo', psychologistId);

  if (error) {
    throw error;
  }

  return data;
};

// Create employee-psychologist associations for all employees of a company
export const associateEmployeesWithPsychologist = async (companyId: number, psychologistId: number) => {
  // First, get all employees for this company
  const { data: employees, error: employeesError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id_empresa', companyId);

  if (employeesError) {
    throw employeesError;
  }

  if (!employees || employees.length === 0) {
    return { message: 'No employees to associate' };
  }

  // Create associations for each employee
  const associations = employees.map(employee => ({
    id_usuario: employee.id,
    id_psicologo: psychologistId,
    status: 'active' // Auto-approve
  }));

  const { data, error } = await supabase
    .from('user_psychologist_associations')
    .insert(associations);

  if (error) {
    throw error;
  }

  return { message: `Associated ${employees.length} employees with psychologist ${psychologistId}` };
};

// Create employee-psychologist associations for a specific employee with all company's psychologists
export const associateEmployeeWithCompanyPsychologists = async (employeeId: number, companyId: number) => {
  // First, get all psychologists for this company
  const { data: associations, error: associationsError } = await supabase
    .from('company_psychologist_associations')
    .select('id_psicologo')
    .eq('id_empresa', companyId)
    .eq('status', 'active');

  if (associationsError) {
    throw associationsError;
  }

  if (!associations || associations.length === 0) {
    return { message: 'No psychologists to associate' };
  }

  // Create associations for each psychologist
  const psychologistAssociations = associations.map(assoc => ({
    id_usuario: employeeId,
    id_psicologo: assoc.id_psicologo,
    status: 'active' // Auto-approve
  }));

  const { data, error } = await supabase
    .from('user_psychologist_associations')
    .insert(psychologistAssociations);

  if (error) {
    throw error;
  }

  return { message: `Associated employee ${employeeId} with ${associations.length} psychologists` };
};

// Remove all associations between company employees and a specific psychologist
export const removeEmployeePsychologistAssociations = async (companyId: number, psychologistId: number) => {
  // First, get all employees for this company
  const { data: employees, error: employeesError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id_empresa', companyId);

  if (employeesError) {
    throw employeesError;
  }

  if (!employees || employees.length === 0) {
    return { message: 'No employees to disassociate' };
  }

  const employeeIds = employees.map(e => e.id);

  // Remove associations
  const { data, error } = await supabase
    .from('user_psychologist_associations')
    .delete()
    .eq('id_psicologo', psychologistId)
    .in('id_usuario', employeeIds);

  if (error) {
    throw error;
  }

  return { message: `Removed associations for ${employees.length} employees with psychologist ${psychologistId}` };
};
