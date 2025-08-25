import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReportStorageService } from '@/services/reportStorageService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Download, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            ReportStorageService.getReport(id)
                .then(data => setReport(data))
                .catch(error => console.error('Erro ao buscar relatório:', error))
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <CompanyDashboardLayout>
                <div className="p-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-20 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </CompanyDashboardLayout>
        );
    }

    if (!report) {
        return (
            <CompanyDashboardLayout>
                <div className="text-center py-16">
                    <h2 className="text-xl font-bold">Relatório não encontrado</h2>
                    <p className="text-gray-600">O relatório que você está procurando não existe ou foi removido.</p>
                    <Button onClick={() => navigate('/company/relatorios')} className="mt-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para Relatórios
                    </Button>
                </div>
            </CompanyDashboardLayout>
        );
    }

    const evidenceFiles = report.report_data?.evidenceFiles || [];

    return (
        <CompanyDashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{report.title}</h1>
                        <p className="text-gray-600">
                            Gerado em: {format(new Date(report.generated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                    </div>
                    <Button onClick={() => navigate('/company/relatorios')} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes do Relatório</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <strong>Período:</strong> {format(new Date(report.report_period_start), 'dd/MM/yyyy')} - {format(new Date(report.report_period_end), 'dd/MM/yyyy')}
                        </div>
                        <div>
                            <strong>Status:</strong> <Badge>{report.status}</Badge>
                        </div>
                        {report.approval_notes && (
                            <div>
                                <strong>Aprovação:</strong> {report.approval_notes}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Evidências Anexadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {evidenceFiles.length > 0 ? (
                            <ul className="space-y-2">
                                {evidenceFiles.map((file: any, index: number) => (
                                    <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                        <div className="flex items-center gap-2">
                                            <Paperclip className="h-4 w-4 text-gray-600" />
                                            <span>{file.name}</span>
                                        </div>
                                        <Button asChild variant="link" size="sm">
                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4 mr-2" />
                                                Baixar
                                            </a>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600">Nenhuma evidência foi anexada a este relatório.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </CompanyDashboardLayout>
    );
};

export default ReportDetails;
