
import React from 'react';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Link as LinkIcon, Key, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <AdminDashboardLayout>
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Painel do Administrador</h1>
          <p className="text-gray-500 mt-2">Gerenciamento central do Portal Calma</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Psicólogos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Psicólogos cadastrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Empresas registradas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Conexões</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Conexões ativas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Licenças</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Licenças emitidas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Pendentes</CardTitle>
              <CardDescription>Itens que requerem sua atenção</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center gap-3 py-3 border-b">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Aprovação de licença</p>
                  <p className="text-xs text-muted-foreground">Empresa X solicitou 10 licenças</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Nova conexão</p>
                  <p className="text-xs text-muted-foreground">Psicólogo Y solicitou conexão com Empresa Z</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm py-2 border-b text-muted-foreground">
                Nenhuma atividade recente registrada.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
