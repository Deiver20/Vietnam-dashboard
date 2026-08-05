/* Panel UI strings, ported from the REAM dashboard's translations.ts and
   remapped to this dashboard's trade domain. English is active; the other
   locales are kept in the same shape so wiring an i18n switch later is a
   one-line change. */

const STRINGS = {
  en: {
    insights: "Insights",
    chat: "Chat",
    generateInsights: "Generate Analysis",
    analyzing: "Analyzing...",
    noInsights: "No insights yet",
    typeMessage: "Type a message...",
    send: "Send",
    clearChat: "Clear",
    aiAssistant: "AI Assistant",
    welcomeMessage:
      "Hello, I'm your AGM assistant. Ask me about the data you're viewing.",
    dataContext: "Based on current data",
    insightsTitle: "Data Insights",
    insightsSubtitle: "AUTOMATIC ANALYSIS",
    topPartner: "Top Partner Country",
    topProduct: "Top Product",
    topSegment: "Top Segment",
    yearGrowth: "Year-over-Year Growth",
    tradeVolume: "Trade Volume",
    activeMarkets: "Active Markets",
  },
  es: {
    insights: "Insights",
    chat: "Chat",
    generateInsights: "Generar Análisis",
    analyzing: "Analizando...",
    noInsights: "Sin insights aún",
    typeMessage: "Escribe un mensaje...",
    send: "Enviar",
    clearChat: "Limpiar",
    aiAssistant: "Asistente IA",
    welcomeMessage:
      "¡Hola! Soy tu asistente AGM. Pregúntame sobre los datos que estás viendo.",
    dataContext: "Basado en datos actuales",
    insightsTitle: "Insights de Datos",
    insightsSubtitle: "ANÁLISIS AUTOMÁTICO",
    topPartner: "País Socio Líder",
    topProduct: "Producto Líder",
    topSegment: "Segmento Líder",
    yearGrowth: "Crecimiento Interanual",
    tradeVolume: "Volumen Comercial",
    activeMarkets: "Mercados Activos",
  },
  fr: {
    insights: "Insights",
    chat: "Chat",
    generateInsights: "Générer l'Analyse",
    analyzing: "Analyse en cours...",
    noInsights: "Pas encore d'insights",
    typeMessage: "Écrivez un message...",
    send: "Envoyer",
    clearChat: "Effacer",
    aiAssistant: "Assistant IA",
    welcomeMessage:
      "Bonjour, je suis votre assistant AGM. Interrogez-moi sur les données affichées.",
    dataContext: "Basé sur les données actuelles",
    insightsTitle: "Insights de Données",
    insightsSubtitle: "ANALYSE AUTOMATIQUE",
    topPartner: "Pays Partenaire Leader",
    topProduct: "Produit Leader",
    topSegment: "Segment Leader",
    yearGrowth: "Croissance Annuelle",
    tradeVolume: "Volume Commercial",
    activeMarkets: "Marchés Actifs",
  },
  pt: {
    insights: "Insights",
    chat: "Chat",
    generateInsights: "Gerar Análise",
    analyzing: "Analisando...",
    noInsights: "Sem insights ainda",
    typeMessage: "Digite uma mensagem...",
    send: "Enviar",
    clearChat: "Limpar",
    aiAssistant: "Assistente IA",
    welcomeMessage:
      "Olá, sou seu assistente AGM. Pergunte-me sobre os dados que está vendo.",
    dataContext: "Com base nos dados atuais",
    insightsTitle: "Insights de Dados",
    insightsSubtitle: "ANÁLISE AUTOMÁTICA",
    topPartner: "País Parceiro Líder",
    topProduct: "Produto Líder",
    topSegment: "Segmento Líder",
    yearGrowth: "Crescimento Anual",
    tradeVolume: "Volume Comercial",
    activeMarkets: "Mercados Ativos",
  },
} as const;

export type PanelStrings = (typeof STRINGS)["en"];

export const t: PanelStrings = STRINGS.en;
