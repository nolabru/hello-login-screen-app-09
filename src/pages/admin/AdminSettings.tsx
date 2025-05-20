
import React from 'react';
import { Helmet } from 'react-helmet';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const AdminSettings: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Configurações | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-medium mb-2">Configurações</h1>
            <p className="text-gray-500">Gerencie as configurações do sistema</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Ajuste as configurações globais do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Esta seção está em desenvolvimento.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminDashboardLayout>
    </>
  );
};

export default AdminSettings;
