
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { checkLicenseAvailability } from '@/services/licenseService';
import { UserProfile } from '@/types/user';
import { Company } from '@/types/company';
import { CompanyLicense } from '@/types/license';

// Import our new components
import UserSearch from '@/components/admin/UserSearch';
import UserTable from '@/components/admin/UserTable';
import DeleteConfirmationDialog from '@/components/admin/DeleteConfirmationDialog';
import AssignCompanyDialog from '@/components/admin/AssignCompanyDialog';

const AdminUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState<UserProfile | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [licenseInfo, setLicenseInfo] = useState<CompanyLicense | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('nome', { ascending: true });
        
      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as UserProfile[];
    }
  });

  // Fetch companies
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['adminCompanies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (error) {
        console.error("Error fetching companies:", error);
        toast({
          title: "Erro ao carregar empresas",
          description: "Não foi possível carregar a lista de empresas.",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Company[];
    }
  });

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      // Check if user has an active license that needs to be freed
      if (userToDelete.license_status === 'active' && userToDelete.id_empresa) {
        // First update license_status to inactive
        await supabase
          .from('user_profiles')
          .update({ license_status: 'inactive' })
          .eq('id', userToDelete.id);
      }
      
      // Then delete the user
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      toast({
        title: "Usuário removido",
        description: `O usuário ${userToDelete.nome} foi removido com sucesso.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao remover usuário",
        description: "Não foi possível remover o usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleAssignClick = (user: UserProfile) => {
    setUserToAssign(user);
    setSelectedCompanyId(user.id_empresa ? String(user.id_empresa) : '');
    setAssignDialogOpen(true);
    
    // Reset license info when opening dialog
    setLicenseInfo(null);
    
    // If a company is already selected, fetch its license info
    if (user.id_empresa) {
      fetchCompanyLicenseInfo(user.id_empresa);
    }
  };
  
  const fetchCompanyLicenseInfo = async (companyId: number) => {
    try {
      const licenseData = await checkLicenseAvailability(companyId);
      setLicenseInfo(licenseData);
    } catch (error) {
      console.error("Error fetching license info:", error);
      setLicenseInfo(null);
      toast({
        title: "Erro ao carregar informações de licença",
        description: "Não foi possível verificar a disponibilidade de licenças.",
        variant: "destructive"
      });
    }
  };
  
  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value);
    
    // Fetch license info when company is selected
    if (value && value !== 'null') {
      fetchCompanyLicenseInfo(parseInt(value));
    } else {
      setLicenseInfo(null);
    }
  };

  const handleAssignConfirm = async () => {
    if (!userToAssign) return;
    setIsLoading(true);
    
    try {
      const newCompanyId = selectedCompanyId === 'null' ? null : selectedCompanyId ? parseInt(selectedCompanyId) : null;
      const prevCompanyId = userToAssign.id_empresa;
      const wasLicensed = userToAssign.license_status === 'active';
      
      // Check if assigning to a company and if there are available licenses
      if (newCompanyId && (!licenseInfo || licenseInfo.available <= 0)) {
        toast({
          title: "Erro ao atribuir usuário",
          description: "A empresa não possui licenças disponíveis para atribuir a este usuário.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Update the user with the selected company ID and activate license
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          id_empresa: newCompanyId,
          license_status: newCompanyId ? 'active' : 'inactive' // Set license status based on company assignment
        })
        .eq('id', userToAssign.id);

      if (error) throw error;

      const companyName = newCompanyId 
        ? companies?.find(c => c.id === parseInt(String(newCompanyId)))?.name 
        : 'nenhuma empresa';

      toast({
        title: "Usuário atualizado",
        description: `${userToAssign.nome} foi atribuído a ${companyName}.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      
      // If company changed and license was previously active, refresh the old company's license info
      if (prevCompanyId && prevCompanyId !== newCompanyId && wasLicensed) {
        queryClient.invalidateQueries({ queryKey: ['companyLicenses', prevCompanyId] });
      }
      
      // If assigned to a new company, refresh that company's license info
      if (newCompanyId) {
        queryClient.invalidateQueries({ queryKey: ['companyLicenses', newCompanyId] });
      }
    } catch (error) {
      console.error("Error assigning user to company:", error);
      toast({
        title: "Erro ao atribuir usuário",
        description: "Não foi possível atribuir o usuário à empresa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setAssignDialogOpen(false);
      setUserToAssign(null);
      setSelectedCompanyId('');
      setLicenseInfo(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Usuários | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-medium mb-2">Usuários</h1>
            <p className="text-gray-500">Gerencie todos os usuários cadastrados no sistema</p>
          </div>

          <UserSearch 
            searchQuery={searchQuery} 
            onSearchQueryChange={setSearchQuery} 
          />

          <UserTable 
            users={users}
            isLoading={usersLoading}
            error={usersError}
            searchQuery={searchQuery}
            companies={companies}
            onAssignClick={handleAssignClick}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </AdminDashboardLayout>

      <DeleteConfirmationDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userToDelete={userToDelete}
        onConfirmDelete={handleDeleteConfirm}
      />

      <AssignCompanyDialog 
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        userToAssign={userToAssign}
        companies={companies}
        companiesLoading={companiesLoading}
        onConfirmAssign={handleAssignConfirm}
        selectedCompanyId={selectedCompanyId}
        onSelectedCompanyIdChange={handleCompanyChange}
        licenseInfo={licenseInfo}
        isLoading={isLoading}
      />
    </>
  );
};

export default AdminUsers;
