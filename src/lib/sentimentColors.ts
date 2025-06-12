/**
 * Arquivo centralizado para definição de cores de sentimentos
 * Usado para garantir consistência visual em todo o aplicativo
 */

// Cores hexadecimais para fundos de sentimentos
export const SENTIMENT_BACKGROUND_COLORS = {
  feliz: "#A5D6A7",    // Verde claro
  triste: "#90CAF9",   // Azul claro
  ansioso: "#FFCC80",  // Laranja claro
  neutro: "#FFD541",   // Amarelo claro
  irritado: "#EF9A9A", // Vermelho claro
};

// Cores hexadecimais para textos de sentimentos (mais escuras para contraste)
export const SENTIMENT_TEXT_COLORS = {
  feliz: "#388E3C",    // Verde escuro
  triste: "#1976D2",   // Azul escuro
  ansioso: "#FF933B",  // Laranja escuro
  neutro: "#C2A200",   // Amarelo escuro
  irritado: "#D32F2F", // Vermelho escuro
};

// Classes Tailwind CSS correspondentes para fundos
export const SENTIMENT_BACKGROUND_CLASSES = {
  feliz: "bg-green-100",
  triste: "bg-blue-100",
  ansioso: "bg-yellow-100",
  neutro: "bg-amber-100",
  irritado: "bg-red-100",
};

// Classes Tailwind CSS correspondentes para textos
export const SENTIMENT_TEXT_CLASSES = {
  feliz: "text-green-600",
  triste: "text-blue-600",
  ansioso: "text-yellow-600",
  neutro: "text-amber-600",
  irritado: "text-red-600",
};

// Função para obter a cor de fundo hexadecimal baseada no sentimento
export const getSentimentBackgroundColor = (sentiment: string): string => {
  const normalizedSentiment = sentiment.toLowerCase();
  return SENTIMENT_BACKGROUND_COLORS[normalizedSentiment as keyof typeof SENTIMENT_BACKGROUND_COLORS] || SENTIMENT_BACKGROUND_COLORS.neutro;
};

// Função para obter a cor de texto hexadecimal baseada no sentimento
export const getSentimentTextColor = (sentiment: string): string => {
  const normalizedSentiment = sentiment.toLowerCase();
  return SENTIMENT_TEXT_COLORS[normalizedSentiment as keyof typeof SENTIMENT_TEXT_COLORS] || SENTIMENT_TEXT_COLORS.neutro;
};

// Função para obter a classe Tailwind de fundo baseada no sentimento
export const getSentimentBackgroundClass = (sentiment: string): string => {
  const normalizedSentiment = sentiment.toLowerCase();
  return SENTIMENT_BACKGROUND_CLASSES[normalizedSentiment as keyof typeof SENTIMENT_BACKGROUND_CLASSES] || SENTIMENT_BACKGROUND_CLASSES.neutro;
};

// Função para obter a classe Tailwind de texto baseada no sentimento
export const getSentimentTextClass = (sentiment: string): string => {
  const normalizedSentiment = sentiment.toLowerCase();
  return SENTIMENT_TEXT_CLASSES[normalizedSentiment as keyof typeof SENTIMENT_TEXT_CLASSES] || SENTIMENT_TEXT_CLASSES.neutro;
};

// Mapeamento de sentimentos para emojis minimalistas
export const SENTIMENT_EMOJIS = {
  feliz: ":)",
  triste: ":(",
  neutro: ":|",
  ansioso: ":S",
  irritado: ">:("
};

// Função para obter o emoji baseado no sentimento
export const getSentimentEmoji = (sentiment: string): string => {
  const normalizedSentiment = sentiment.toLowerCase();
  return SENTIMENT_EMOJIS[normalizedSentiment as keyof typeof SENTIMENT_EMOJIS] || SENTIMENT_EMOJIS.neutro;
};

// Lista de todos os sentimentos suportados
export const SUPPORTED_SENTIMENTS = ['feliz', 'triste', 'neutro', 'ansioso', 'irritado'];
