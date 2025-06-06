import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
const RecentPatientActivity: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento para manter a experiência do usuário
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  return <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4 text-neutral-700">Atividades Recentes</h3>
        
        {loading ? <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="h-3 w-48 bg-gray-100 animate-pulse rounded"></div>
                </div>
                <div className="h-3 w-16 bg-gray-100 animate-pulse rounded"></div>
              </div>)}
          </div> : <div className="flex flex-col items-center justify-center text-center py-8">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Funcionalidade em Breve</h3>
            <p className="text-gray-500 max-w-md">
              Estamos trabalhando em uma nova funcionalidade que vai melhorar ainda mais sua experiência!
              Em breve, você poderá acessar as Atividades Recentes de forma prática, rápida e intuitiva.
            </p>
          </div>}
      </CardContent>
    </Card>;
};
export default RecentPatientActivity;
