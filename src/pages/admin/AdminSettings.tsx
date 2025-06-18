
import React from 'react';
import { Helmet } from 'react-helmet';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const AdminSettings: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Prompt da AIA | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-neutral-700">Prompt da AIA</h1>
            <p className="text-gray-500">Gerencie os prompts usados pelo assistente de IA</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Configure as opções do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Não há configurações disponíveis no momento.</p>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    </>
  );
};

export default AdminSettings;
