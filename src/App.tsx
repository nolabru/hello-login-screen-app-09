import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PsychologistRegistration from "./pages/PsychologistRegistration";
import CompanyRegistration from "./pages/CompanyRegistration";
import PsychologistDashboard from "./pages/PsychologistDashboard";
import PsychologistPatients from "./pages/PsychologistPatients";
import PsychologistSettings from "./pages/PsychologistSettings";
import PsychologistCompanies from "./pages/PsychologistCompanies";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyEmployees from "./pages/CompanyEmployees";
import CompanyPsychologists from "./pages/CompanyPsychologists";
import CompanyLicenses from "./pages/CompanyLicenses";
import CompanyComplianceReport from "./pages/CompanyComplianceReport";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminConnections from "./pages/admin/AdminConnections";

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
              <Route path="/register/psychologist" element={<PsychologistRegistration />} />
              <Route path="/register/company" element={<CompanyRegistration />} />
              
              {/* Psychologist Routes */}
              <Route path="/dashboard" element={<PsychologistDashboard />} />
              <Route path="/pacientes" element={<PsychologistPatients />} />
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
              <Route path="/admin/connections" element={<AdminConnections />} />
              {/* Other admin routes can be added here as needed */}
              
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
