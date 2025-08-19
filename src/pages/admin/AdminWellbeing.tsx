import React from 'react';
import { Helmet } from 'react-helmet';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Library, ListOrdered, Music } from 'lucide-react';

// These components will be created in subsequent steps
import ArticleForm from '@/components/admin/wellbeing/ArticleForm';
import TrackForm from '@/components/admin/wellbeing/TrackForm';
import PhaseForm from '@/components/admin/wellbeing/PhaseForm';
import SoundForm from '@/components/admin/wellbeing/SoundForm';

const AdminWellbeing: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Bem-Estar | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6 space-y-6">
          <header className="mb-2">
            <h1 className="text-2xl font-medium text-neutral-700">Bem-Estar</h1>
            <p className="text-gray-500">
              Cadastre e gerencie conteúdos de bem-estar: artigos, trilhas, fases e sons.
            </p>
          </header>

          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Artigos
              </TabsTrigger>
              <TabsTrigger value="tracks" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                Trilhas
              </TabsTrigger>
              <TabsTrigger value="phases" className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4" />
                Fases
              </TabsTrigger>
              <TabsTrigger value="sounds" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Sons
              </TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="mt-6">
              <ArticleForm />
            </TabsContent>

            <TabsContent value="tracks" className="mt-6">
              <TrackForm />
            </TabsContent>

            <TabsContent value="phases" className="mt-6">
              <PhaseForm />
            </TabsContent>

            <TabsContent value="sounds" className="mt-6">
              <SoundForm />
            </TabsContent>
          </Tabs>
        </div>
      </AdminDashboardLayout>
    </>
  );
};

export default AdminWellbeing;
