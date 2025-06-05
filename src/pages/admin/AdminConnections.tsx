
import React from 'react';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const AdminConnections = () => {

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gerenciamento de Conexões</h1>
          <p className="text-gray-500 mt-2">Administre conexões entre psicólogos e empresas</p>
        </header>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Conexões Psicólogo-Empresa</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Funcionalidade Indisponível</h3>
            <p className="text-gray-500 max-w-md">
              A funcionalidade de gerenciamento de conexões entre empresas e psicólogos foi removida do sistema.
              Entre em contato com o suporte para mais informações.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminConnections;
