
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIPromptManager from '@/components/admin/AIPromptManager';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("system");
  
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

          <Tabs defaultValue="system" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="ai-prompts">Prompts da IA</TabsTrigger>
            </TabsList>
            
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>Ajuste as configurações globais do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Esta seção está em desenvolvimento.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ai-prompts">
              <Card>
                <CardHeader>
                  <CardTitle>Prompts da IA</CardTitle>
                  <CardDescription>Configure os prompts usados pelo assistente de IA</CardDescription>
                </CardHeader>
                <CardContent>
                  <AIPromptManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminDashboardLayout>
    </>
  );
};

export default AdminSettings;
