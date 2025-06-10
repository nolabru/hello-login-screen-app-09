import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Flame, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Função utilitária para obter a URL da foto de perfil
const getProfilePhotoUrl = (profilePhoto: any): string | null => {
  if (!profilePhoto) return null;
  
  // Se já for uma URL completa
  if (typeof profilePhoto === 'string' && profilePhoto.startsWith('http')) {
    return profilePhoto;
  }
  
  // Se for um objeto com path ou url
  if (typeof profilePhoto === 'object' && profilePhoto !== null) {
    const path = profilePhoto.path || profilePhoto.url;
    if (path) return path;
  }
  
  try {
    // Tentar obter a URL pública via Supabase
    const { data } = supabase.storage.from('profiles').getPublicUrl(profilePhoto);
    if (data?.publicUrl) return data.publicUrl;
    
    // Fallback: construir a URL manualmente
    const supabaseUrl = "https://ygafwrebafehwaomibmm.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/profiles/${profilePhoto}`;
  } catch (error) {
    console.error('Erro ao obter URL da foto de perfil:', error);
    return null;
  }
};

// Tipos para os rankings
interface InteractionRanking {
  user_id: string;
  name: string;
  profile_photo?: string;
  interaction_count: number;
  predominant_mood?: string; // Sentimento predominante
}

interface StreakRanking {
  user_id: string;
  name: string;
  profile_photo?: string;
  current_streak: number;
  predominant_mood?: string; // Sentimento predominante
}

const RecentPatientActivity: React.FC = () => {
  const [activeTab, setActiveTab] = useState('interactions');
  const [interactionsRanking, setInteractionsRanking] = useState<InteractionRanking[]>([]);
  const [streaksRanking, setStreaksRanking] = useState<StreakRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados de ranking de interações
  const fetchInteractionsRanking = async () => {
    try {
      // Passo 1: Buscar todas as sessões com sentimento
      const { data: sessions, error: sessionsError } = await supabase
        .from('call_sessions')
        .select('user_id, mood')
        .limit(100);
        
      if (sessionsError) throw sessionsError;
      
      // Verificar se temos dados de sessões
      if (!sessions || sessions.length === 0) {
        setInteractionsRanking([]);
        return;
      }
      
      // Agrupar por usuário, contar interações e rastrear sentimentos
      const userInteractions = new Map<string, number>();
      const userMoods = new Map<string, Map<string, number>>();
      
      sessions.forEach(session => {
        const userId = session.user_id;
        const mood = session.mood;
        
        if (userId) {
          // Contar interações
          userInteractions.set(userId, (userInteractions.get(userId) || 0) + 1);
          
          // Rastrear sentimentos
          if (mood) {
            if (!userMoods.has(userId)) {
              userMoods.set(userId, new Map<string, number>());
            }
            const moodMap = userMoods.get(userId)!;
            moodMap.set(mood, (moodMap.get(mood) || 0) + 1);
          }
        }
      });
      
      // Calcular o sentimento predominante para cada usuário
      const userPredominantMood = new Map<string, string>();
      userMoods.forEach((moodMap, userId) => {
        let maxCount = 0;
        let predominantMood = '';
        
        moodMap.forEach((count, mood) => {
          if (count > maxCount) {
            maxCount = count;
            predominantMood = mood;
          }
        });
        
        if (predominantMood) {
          userPredominantMood.set(userId, predominantMood);
        }
      });
      
      // Se não houver interações, retornar array vazio
      if (userInteractions.size === 0) {
        setInteractionsRanking([]);
        return;
      }
      
      try {
        // Passo 2: Buscar informações dos usuários
        const userIdList = Array.from(userInteractions.keys());
        
        // Buscar informações dos usuários
        const { data: userProfiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('user_id', userIdList);
          
        if (profilesError) throw profilesError;
        
        // Criar um mapa de perfis de usuário para fácil acesso
        const userProfileMap = new Map();
        if (userProfiles) {
          userProfiles.forEach(profile => {
            userProfileMap.set(profile.user_id, profile);
          });
        }
        
        // Criar o ranking final
        const rankingArray: InteractionRanking[] = Array.from(userInteractions.entries())
          .map(([userId, count]) => {
            const profile = userProfileMap.get(userId) as any;
            // Usar uma abordagem segura para obter o nome, tentando diferentes campos
            const userName = profile 
              ? (profile.full_name || profile.preferred_name || `Usuário ${userId.substring(0, 4)}`)
              : `Usuário ${userId.substring(0, 4)}`;
              
            return {
              user_id: userId,
              name: userName,
              profile_photo: profile?.profile_photo,
              interaction_count: count,
              predominant_mood: userPredominantMood.get(userId)
            };
          })
          .sort((a, b) => b.interaction_count - a.interaction_count)
          .slice(0, 10);
        
        setInteractionsRanking(rankingArray);
      } catch (profileError) {
        console.error('Erro ao buscar perfis de usuários:', profileError);
        
        // Fallback: Criar o ranking sem informações de perfil
        const rankingArray: InteractionRanking[] = Array.from(userInteractions.entries())
          .map(([userId, count]) => ({
            user_id: userId,
            name: `Usuário ${userId.substring(0, 4)}`,
            profile_photo: undefined,
            interaction_count: count,
            predominant_mood: userPredominantMood.get(userId)
          }))
          .sort((a, b) => b.interaction_count - a.interaction_count)
          .slice(0, 10);
        
        setInteractionsRanking(rankingArray);
      }
    } catch (error) {
      console.error('Erro ao buscar ranking de interações:', error);
      setError('Não foi Possível Carregar o Ranking de Interações.');
    }
  };

  // Buscar dados de ranking de streaks
  const fetchStreaksRanking = async () => {
    try {
      console.log('=== DIAGNÓSTICO: Iniciando fetchStreaksRanking ===');
      
      // Buscar diretamente os dados de streak
      console.log('Executando consulta à tabela user_streaks...');
      const { data: streakData, error: streakError } = await (supabase as any)
        .from('user_streaks')
        .select('user_id, current_streak')
        .order('current_streak', { ascending: false })
        .limit(10);
        
      // Buscar dados de sentimento das sessões para os usuários com streak
      const { data: sessions, error: sessionsError } = await supabase
        .from('call_sessions')
        .select('user_id, mood')
        .in('user_id', streakData?.map((streak: any) => streak.user_id) || [])
        .limit(100);
        
      // Calcular o sentimento predominante para cada usuário
      const userPredominantMood = new Map<string, string>();
      
      if (sessions && !sessionsError) {
        // Agrupar sentimentos por usuário
        const userMoods = new Map<string, Map<string, number>>();
        
        sessions.forEach(session => {
          const userId = session.user_id;
          const mood = session.mood;
          
          if (userId && mood) {
            if (!userMoods.has(userId)) {
              userMoods.set(userId, new Map<string, number>());
            }
            const moodMap = userMoods.get(userId)!;
            moodMap.set(mood, (moodMap.get(mood) || 0) + 1);
          }
        });
        
        // Determinar o sentimento predominante para cada usuário
        userMoods.forEach((moodMap, userId) => {
          let maxCount = 0;
          let predominantMood = '';
          
          moodMap.forEach((count, mood) => {
            if (count > maxCount) {
              maxCount = count;
              predominantMood = mood;
            }
          });
          
          if (predominantMood) {
            userPredominantMood.set(userId, predominantMood);
          }
        });
      }
      
      console.log('Resultado da consulta:', { streakData, streakError });
        
      if (streakError) {
        console.error('Erro ao buscar dados de streaks:', streakError);
        console.error('Detalhes do erro:', JSON.stringify(streakError, null, 2));
        setError('Não foi possível carregar o ranking de dias consecutivos.');
        return;
      }
      
      // Verificar se temos dados
      if (!streakData) {
        console.log('Nenhum dado retornado (streakData é null ou undefined)');
        setStreaksRanking([]);
        return;
      }
      
      if (streakData.length === 0) {
        console.log('Array de dados vazio (streakData.length === 0)');
        setStreaksRanking([]);
        return;
      }
      
      console.log('Dados encontrados:', streakData.length, 'registros');
      console.log('Primeiro registro:', streakData[0]);
      
      // Buscar informações dos usuários para exibir nomes
      const userIds = streakData.map((streak: any) => streak.user_id);
      console.log('Buscando informações dos usuários com IDs:', userIds);
      
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', userIds);
      
      console.log('Resultado da busca de perfis:', { userProfiles, profilesError });
        
      // Criar um mapa de perfis de usuário para fácil acesso
      const userProfileMap = new Map();
      if (userProfiles && !profilesError) {
        userProfiles.forEach((profile: any) => {
          userProfileMap.set(profile.user_id, profile);
        });
        console.log('Mapa de perfis criado com', userProfileMap.size, 'entradas');
      } else {
        console.log('Nenhum perfil de usuário encontrado ou erro ao buscar perfis');
      }
      
      // Criar o ranking final
      console.log('Criando ranking final...');
      const rankingArray: StreakRanking[] = streakData.map((streak: any) => {
        console.log('Processando streak:', streak);
        const profile = userProfileMap.get(streak.user_id) as any;
        console.log('Perfil encontrado para', streak.user_id, ':', profile);
        
        // Usar uma abordagem segura para obter o nome, tentando diferentes campos
        const userName = profile 
          ? (profile.full_name || profile.preferred_name || `Usuário ${streak.user_id.substring(0, 4)}`)
          : `Usuário ${streak.user_id.substring(0, 4)}`;
        
        console.log('Nome de usuário determinado:', userName);
          
        return {
          user_id: streak.user_id,
          name: userName,
          profile_photo: profile?.profile_photo,
          current_streak: streak.current_streak,
          predominant_mood: userPredominantMood.get(streak.user_id)
        };
      });
      
      console.log('Ranking final criado:', rankingArray);
      console.log('Definindo estado streaksRanking...');
      setStreaksRanking(rankingArray);
      console.log('Estado streaksRanking atualizado');
    } catch (error) {
      console.error('Erro ao buscar ranking de streaks:', error);
      setError('Não foi possível carregar o ranking de dias consecutivos.');
    }
  };

  // Efeito para carregar os dados
  useEffect(() => {
    const loadData = async () => {
      console.log('=== DIAGNÓSTICO: Iniciando carregamento de dados ===');
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchInteractionsRanking(),
          fetchStreaksRanking()
        ]);
        console.log('Carregamento de dados concluído com sucesso');
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Ocorreu um erro ao carregar os rankings.');
      } finally {
        setLoading(false);
        console.log('Estado de loading definido como false');
      }
    };
    
    loadData();
  }, []);
  
  // Efeito para verificar quando a aba ativa muda
  useEffect(() => {
    console.log('=== DIAGNÓSTICO: Aba ativa alterada para:', activeTab, '===');
  }, [activeTab]);
  
  // Definir a aba ativa como "streaks" para teste
  useEffect(() => {
    console.log('=== DIAGNÓSTICO: Definindo aba ativa como "streaks" para teste ===');
    setActiveTab('streaks');
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4 text-neutral-700">Atividades Recentes</h3>
        
        {error ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Erro ao Carregar Dados</h3>
            <p className="text-gray-500 max-w-md">{error}</p>
          </div>
        ) : (
          <Tabs defaultValue="interactions" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="interactions" className="flex items-center gap-2 flex-1">
                <MessageSquare className="h-4 w-4" />
                <span>Interações com AIA</span>
              </TabsTrigger>
              <TabsTrigger value="streaks" className="flex items-center gap-2 flex-1">
                <Flame className="h-4 w-4" />
                <span>Dias Consecutivos</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="interactions">
              {loading ? (
                <RankingSkeleton />
              ) : interactionsRanking.length > 0 ? (
                <div className="space-y-3">
                  {interactionsRanking.map((item, index) => (
                    <RankingItem
                      key={item.user_id}
                      position={index + 1}
                      name={item.name}
                      value={item.interaction_count}
                      valueLabel="Interações"
                      profilePhoto={item.profile_photo}
                      type="interactions"
                      predominantMood={item.predominant_mood}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="Nenhuma interação registrada ainda." />
              )}
            </TabsContent>
            
            <TabsContent value="streaks">
              {loading ? (
                <RankingSkeleton />
              ) : streaksRanking.length > 0 ? (
                <div className="space-y-3">
                  {streaksRanking.map((item, index) => (
                    <RankingItem
                      key={item.user_id}
                      position={index + 1}
                      name={item.name}
                      value={item.current_streak}
                      valueLabel="Dias"
                      profilePhoto={item.profile_photo}
                      type="streaks"
                      predominantMood={item.predominant_mood}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="Nenhum streak registrado ainda." />
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para exibir um item do ranking
const RankingItem: React.FC<{
  position: number;
  name: string;
  value: number;
  valueLabel: string;
  profilePhoto?: string;
  type?: 'interactions' | 'streaks';
  predominantMood?: string;
}> = ({ position, name, value, valueLabel, profilePhoto, type = 'interactions', predominantMood }) => {
  
  // Estado para controlar se a imagem carregou com sucesso
  const [imageError, setImageError] = useState(false);
  
  // Obter a URL da foto de perfil
  const photoUrl = !imageError ? getProfilePhotoUrl(profilePhoto) : null;
  
  // Determinar a cor do fundo (mais clara para os 3 primeiros)
  const getBackgroundColor = (pos: number) => {
    switch (pos) {
      case 1: return 'bg-yellow-200'; // Ouro claro
      case 2: return 'bg-gray-200';   // Prata claro
      case 3: return 'bg-amber-100';  // Bronze claro (mais marrom)
      default: return 'bg-gray-100';  // Outras posições
    }
  };
  
  // Determinar a cor do ícone (mais escura para os 3 primeiros)
  const getIconColor = (pos: number) => {
    switch (pos) {
      case 1: return 'text-yellow-600'; // Ouro escuro
      case 2: return 'text-gray-600';   // Prata escuro
      case 3: return 'text-amber-900';  // Bronze escuro (mais marrom)
      default: return 'text-gray-500';  // Outras posições
    }
  };
  
  // Renderizar o conteúdo do círculo (ícone ou número)
  const renderPositionIndicator = () => {
    // Para os 3 primeiros, mostrar ícone
    if (position <= 3) {
      if (type === 'interactions') {
        return <MessageSquare className={`h-4 w-4 ${getIconColor(position)}`} />;
      } else {
        return <Flame className={`h-4 w-4 ${getIconColor(position)}`} />;
      }
    }
    
    // Para os outros, mostrar número com fonte menor
    return <span className="text-sm">{position}</span>;
  };

  // Obter as iniciais do nome para o fallback
  const getInitials = () => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 transition-colors">
      {/* Posição no ranking */}
      <div className={`flex items-center justify-center h-8 w-8 rounded-full ${getBackgroundColor(position)} ${getIconColor(position)}`}>
        {renderPositionIndicator()}
      </div>
      
      {/* Avatar e nome */}
      <div className="flex items-center gap-3 flex-1">
        <Avatar>
          {photoUrl ? (
            <AvatarImage 
              src={photoUrl} 
              alt={name}
              onError={() => setImageError(true)}
              style={{ objectFit: 'cover' }}
            />
          ) : null}
          <AvatarFallback className="bg-portal-purple text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-neutral-700">{name}</p>
          {predominantMood && (
            <p className="text-xs text-gray-500">O Paciente tem se sentido {predominantMood.charAt(0).toUpperCase() + predominantMood.slice(1)}</p>
          )}
        </div>
      </div>
      
      {/* Valor (interações ou streak) */}
      <div className="text-right">
        <p className="font-bold text-lg text-portal-purple">{value}</p>
        <p className="text-xs text-gray-500">{valueLabel}</p>
      </div>
    </div>
  );
};

// Componente para exibir o estado de carregamento
const RankingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 border rounded-md">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1"></div>
        </div>
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
      </div>
    ))}
  </div>
);

// Componente para exibir o estado vazio
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center text-center py-8">
    <p className="text-gray-500">{message}</p>
  </div>
);

export default RecentPatientActivity;
