
import React from 'react';
import { Helmet } from 'react-helmet';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AIPromptManager from '@/components/admin/AIPromptManager';

const AdminSettings: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Prompt da AIA | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-medium mb-2">Prompt da AIA</h1>
            <p className="text-gray-500">Gerencie os prompts usados pelo assistente de IA</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Prompt da AIA</CardTitle>
              <CardDescription>Configure os prompts usados pelo assistente de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <AIPromptManager />
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    </>
  );
};

export default AdminSettings;
