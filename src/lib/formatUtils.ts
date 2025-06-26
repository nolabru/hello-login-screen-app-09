/**
 * Formata o nome de um tópico removendo underscores e capitalizando palavras
 * @param topic - O tópico a ser formatado (ex: "apoio_emocional")
 * @returns O tópico formatado (ex: "Apoio Emocional")
 */
export const formatTopicName = (topic: string): string => {
  if (!topic || typeof topic !== 'string') {
    return topic;
  }
  
  return topic
    .replace(/_/g, ' ')           // Remove underscores
    .split(' ')                   // Divide em palavras
    .map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )                             // Capitaliza cada palavra
    .join(' ');                   // Junta novamente
};

/**
 * Formata uma lista de tópicos
 * @param topics - Array de tópicos para formatar
 * @returns Array de tópicos formatados
 */
export const formatTopicsList = (topics: string[]): string[] => {
  return topics.map(topic => formatTopicName(topic));
};
