
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmailVerified from "./pages/EmailVerified";
import EmailVerificationPending from "./pages/EmailVerificationPending";
import ResetPassword from "./pages/ResetPassword";
import PsychologistRegistration from "./pages/PsychologistRegistration";
import CompanyRegistration from "./pages/CompanyRegistration";
import PsychologistDashboard from "./pages/PsychologistDashboard";
import PsychologistPatients from "./pages/PsychologistPatients";
import PsychologistSettings from "./pages/PsychologistSettings";
import PsychologistCompanies from "./pages/PsychologistCompanies";
import PatientDetails from "./pages/PatientDetails";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyEmployees from "./pages/CompanyEmployees";
import CompanyPsychologists from "./pages/CompanyPsychologists";
import CompanyLicenses from "./pages/CompanyLicenses";
import CompanyComplianceReport from "./pages/CompanyComplianceReport";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPsychologists from "./pages/admin/AdminPsychologists";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminLicenses from "./pages/admin/AdminLicenses";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAIReports from "./pages/admin/AdminAIReports";
import AdminPrompts from "./pages/admin/AdminPrompts";
import PsychologistInviteHandler from "./pages/PsychologistInviteHandler";
import RedirectInvite from "./pages/RedirectInvite";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SupportPage from "./pages/suporte";
import UserProfile from "./pages/UserProfile";

// Create a new QueryClient instance outside the component
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/email-verificado" element={<EmailVerified />} />
              <Route path="/verificacao-pendente" element={<EmailVerificationPending />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register/psychologist" element={<PsychologistRegistration />} />
              <Route path="/register/company" element={<CompanyRegistration />} />
              <Route path="/redirect-invite" element={<RedirectInvite />} />
              <Route path="/psychologist/enter-code" element={<PsychologistInviteHandler />} />
              
              {/* Psychologist Routes */}
              <Route path="/dashboard" element={<PsychologistDashboard />} />
              <Route path="/pacientes" element={<PsychologistPatients />} />
              <Route path="/patients/:id" element={<PatientDetails />} />
              <Route path="/configuracoes" element={<PsychologistSettings />} />
              <Route path="/empresas" element={<PsychologistCompanies />} />
              
              {/* Company Routes */}
              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/company/funcionarios" element={<CompanyEmployees />} />
              <Route path="/company/psicologos" element={<CompanyPsychologists />} />
              <Route path="/company/licencas" element={<CompanyLicenses />} />
              <Route path="/company/relatorio-conformidade" element={<CompanyComplianceReport />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/psychologists" element={<AdminPsychologists />} />
              <Route path="/admin/companies" element={<AdminCompanies />} />
              <Route path="/admin/licenses" element={<AdminLicenses />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/ai-reports" element={<AdminAIReports />} />
              <Route path="/admin/prompts" element={<AdminPrompts />} />
              
              {/* Página de Política de Privacidade */}
              <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
              
              {/* Página de Suporte */}
              <Route path="/suporte" element={<SupportPage />} />
              
              {/* Página de Perfil do Usuário */}
              <Route path="/user/profile" element={<UserProfile />} />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
