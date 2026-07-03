export type Locale = "en" | "es" | "fr" | "pt";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DashboardState {
  locale: Locale;
  rightPanelCollapsed: boolean;
  rightPanelMode: "insights" | "chat";
  chatMessages: ChatMessage[];
  isLoadingChat: boolean;
  setLocale: (locale: Locale) => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  setRightPanelMode: (mode: "insights" | "chat") => void;
  addChatMessage: (message: ChatMessage) => void;
  setIsLoadingChat: (loading: boolean) => void;
  clearChat: () => void;
}

export interface Translation {
  nav: {
    dashboard: string;
    importsOverview: string;
    totalImports: string;
    hsCodes: string;
    importsByProduct: string;
    importsTimeline: string;
    tradersAndCustoms: string;
    tradersAndCustomsDetailed: string;
    countriesDetailed: string;
    importsByCountry: string;
    importsOperations: string;
    comingSoon: string;
  };
  filters: {
    title: string;
    category: string;
    countryOfOrigin: string;
    product: string;
    custom: string;
    importer: string;
    exporter: string;
    year: string;
    yearStart: string;
    yearEnd: string;
    all: string;
    search: string;
    apply: string;
    reset: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    kpiTotalVolume: string;
    kpiTotalRecords: string;
    kpiTotalCif: string;
    kpiCountries: string;
    kpiProducts: string;
    chartImportsByCountry: string;
    chartImportsByCountryRace: string;
    chartImportsByImporterRace: string;
    chartVolumeMt: string;
    chartVolumeMtRace: string;
    noData: string;
  };
  panel: {
    insights: string;
    chat: string;
    chatPlaceholder: string;
    send: string;
    generating: string;
    askAboutData: string;
    totalVolume: string;
    topCountry: string;
    topProduct: string;
    yearRange: string;
    open: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    close: string;
    open: string;
    play: string;
    pause: string;
    replay: string;
  };
  placeholder: {
    select: string;
  };
}
