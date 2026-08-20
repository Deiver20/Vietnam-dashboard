import type { NewsPost, Trending } from "@/interfaces/news/interface";

export type Post = NewsPost;

/* News publications. Card + modal contract: title, summary, categories
   (max 2), one image, reading time (min) — the modal adds the subtitled
   body sections. `industry` only feeds the filter bar. */
export const POSTS: NewsPost[] = [
  {
    id: 1,
    title: "La Unión Nacional de Avicultores busca desarrollar un Sistema Integral de Información Estratégica",
    summary: "La iniciativa busca consolidar datos de producción, comercio y sanidad avícola en una sola plataforma accesible para empresas del sector y reguladores, con potencial de integración con fuentes como AGM Data.",
    categories: ["Poultry", "Innovation"],
    image: "assets/news_poultry.webp",
    industry: "chicken_meat",
    date: "2026-05-15",
    readingTime: 4,
    sections: [
      {
        subtitle: "Una plataforma única para todo el sector avícola",
        paragraphs: [
          "La Unión Nacional de Avicultores (UNA) ha anunciado un ambicioso proyecto para desarrollar un Sistema Integral de Información Estratégica (SIES) que consolidará datos de producción, comercio y sanidad avícola en una única plataforma digital.",
          "El sistema, que se espera esté operativo para finales de 2026, busca ofrecer a empresas del sector avícola y reguladores gubernamentales acceso en tiempo real a indicadores clave de rendimiento, tendencias de mercado y alertas sanitarias.",
          "Según fuentes de la UNA, la plataforma integrará datos provenientes de múltiples fuentes, incluyendo registros gubernamentales, sistemas de trazabilidad privados y bases de datos comerciales. Una de las integraciones más destacadas será con AGM Data, permitiendo a los usuarios acceder a información de comercio internacional de productos avícolas directamente desde el dashboard del SIES.",
        ],
      },
      {
        subtitle: "Inversión y financiamiento",
        paragraphs: [
          "\"El sector avícola mexicano genera más de $15 mil millones anuales y emplea a cerca de 250,000 personas directamente. Sin embargo, la toma de decisiones sigue basándose en datos fragmentados y con rezagos significativos. El SIES cambiará eso\", afirmó el presidente de la UNA en la presentación del proyecto.",
          "El desarrollo del sistema contará con una inversión inicial de $4.2 millones de dólares, financiados en parte por la Secretaría de Agricultura y Desarrollo Rural (SADER) y fondos del Banco Interamericano de Desarrollo (BID).",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "¿Son los insectos una proteína sostenible para la alimentación animal?",
    summary: "El mercado global de proteína de insectos para alimentación animal alcanzará los $3.2 mil millones para 2028. Empresas en Europa y LatAm aceleran inversiones en procesamiento de mosca soldado negra (BSF) como alternativa a la soya.",
    categories: ["Agriculture", "Innovation"],
    image: "assets/news_insects.webp",
    industry: "feed",
    date: "2026-05-14",
    readingTime: 5,
    sections: [
      {
        subtitle: "Un mercado en plena expansión",
        paragraphs: [
          "El mercado global de proteína de insectos para alimentación animal está experimentando un crecimiento sin precedentes, con proyecciones que indican alcanzará los $3.2 mil millones para 2028, impulsado por la creciente demanda de alternativas proteicas sostenibles.",
          "Empresas en Europa y América Latina están acelerando significativamente sus inversiones en instalaciones de procesamiento de mosca soldado negra (Hermetia illucens, BSF). Esta especie se ha consolidado como la más prometedora para producción a escala industrial debido a su rápido ciclo de vida, alta tasa de conversión de biomasa y perfil aminoacídico completo.",
          "En Europa, compañías como InnovaFeed y Protix han anunciado expansiones de capacidad que duplicarán su producción combinada para 2027. En América Latina, startups en Brasil, Colombia y México están captando capital de riesgo para desarrollar plantas piloto con capacidades entre 5,000 y 20,000 toneladas anuales.",
        ],
      },
      {
        subtitle: "La ventaja ambiental frente a la soya",
        paragraphs: [
          "La principal ventaja competitiva de la proteína de insectos sobre la soya convencional radica en su huella ambiental. Según análisis de ciclo de vida recientes, la producción de harina de BSF requiere un 90% menos de tierra, un 50% menos de energía y genera un 80% menos de emisiones de gases de efecto invernadero por kilogramo de proteína producida en comparación con la soya cultivada en regiones deforestadas.",
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Mapa de fabricantes de alimentos para mascotas en EE. UU.: La geografía define la industria",
    summary: "Un análisis de 1,200 plantas de producción de petfood en EE.UU. revela que el Midwest concentra el 43% de la capacidad instalada, impulsado por la proximidad a materias primas de granos y proteínas animales. El patrón geográfico anticipa tendencias de inversión para los próximos 5 años.",
    categories: ["Big Data", "Pet Food"],
    image: "assets/news_petfood_map.webp",
    industry: "petfood",
    date: "2026-05-08",
    readingTime: 5,
    sections: [
      {
        subtitle: "El Midwest, corazón de la producción",
        paragraphs: [
          "Un análisis geoespacial exhaustivo de 1,200 plantas de producción de alimentos para mascotas en Estados Unidos revela patrones de concentración que definen la estructura competitiva del sector y anticipan las zonas de mayor actividad inversora para el período 2026–2030.",
          "El Medio Oeste (Midwest) concentra el 43% de la capacidad instalada nacional, una distribución directamente correlacionada con la proximidad a los principales centros de producción de granos (maíz y soya) y plantas de procesamiento de proteínas animales. Estados como Kansas, Iowa y Nebraska albergan las mayores densidades de instalaciones por kilómetro cuadrado.",
        ],
      },
      {
        subtitle: "El Sureste acelera y emergen nuevos corredores",
        paragraphs: [
          "La región Sureste, liderada por Carolina del Norte y Georgia, ha experimentado el crecimiento más rápido en los últimos tres años, con una tasa de expansión del 12% anual. Este dinamismo se atribuye a menores costos operativos, incentivos fiscales estatales y proximidad a puertos de exportación hacia mercados latinoamericanos.",
          "El análisis identifica además 14 \"corredores de inversión\" emergentes donde la convergencia de disponibilidad de mano de obra calificada, infraestructura logística y acceso a materias primas crea condiciones favorables para nuevas instalaciones. Los modelos predictivos sugieren que estas áreas capturarán aproximadamente $2.8 mil millones en inversiones de capital durante los próximos cinco años.",
        ],
      },
    ],
  },
  {
    id: 7,
    title: "Las importaciones de soja de China alcanzan un nivel casi récord mientras se prolonga la guerra comercial",
    summary: "China incrementó sus importaciones de soja a 9.5 millones de toneladas en septiembre, segundo volumen mensual más alto registrado. La diversificación hacia Brasil y Argentina sigue acelerando, reduciendo la dependencia de EE.UU. del 35% al 18% en dos años.",
    categories: ["Commodities", "Trade"],
    image: "assets/marketplace_grain.webp",
    industry: "grains",
    date: "2026-04-28",
    readingTime: 4,
    sections: [
      {
        subtitle: "Septiembre roza el máximo histórico",
        paragraphs: [
          "China registró en septiembre un volumen de importación de soja de 9.5 millones de toneladas métricas, el segundo nivel mensual más alto en la historia del país asiático, según datos publicados por la Administración General de Aduanas de China (GACC).",
          "El dato refleja una aceleración significativa en la diversificación de proveedores que ha caracterizado a la política comercial agrícola china desde 2024. La dependencia de soya estadounidense ha caído del 35% al 18% del total de importaciones en solo dos años, un cambio estructural sin precedentes en el comercio global de oleaginosas.",
        ],
      },
      {
        subtitle: "Sudamérica captura el reordenamiento",
        paragraphs: [
          "Brasil se ha consolidado como el principal beneficiario de este reordenamiento, capturando aproximadamente el 68% de las compras chinas de soja en 2025, frente al 55% registrado en 2023. Argentina, por su parte, ha recuperado participación de mercado tras la normalización de su producción post-sequía.",
          "Analistas de comercio internacional advierten que la reducida dependencia china de suministros estadounidenses introduce una nueva volatilidad en los precios globales de la soja, ya que los movimientos de compra de Beijing ahora responden más a dinámicas bilaterales con productores sudamericanos que a las condiciones del Midwest de Estados Unidos.",
        ],
      },
    ],
  },
  {
    id: 9,
    title: "ABRA lanza el exclusivo Monitor CSI: más agilidad y precisión en las exportaciones de rendering",
    summary: "La Associação Brasileira de Reciclagem Animal presentó el Monitor CSI, una herramienta de seguimiento en tiempo real de exportaciones de harinas y grasas animales con integración directa a datos aduaneros. Brasil exporta más de $2.1 mil millones anuales en subproductos animales.",
    categories: ["Rendering", "Big Data"],
    image: "assets/rendering_bg.webp",
    industry: "rendering",
    date: "2026-04-18",
    readingTime: 4,
    sections: [
      {
        subtitle: "Datos aduaneros en tiempo casi real",
        paragraphs: [
          "La Associação Brasileira de Reciclagem Animal (ABRA) ha lanzado oficialmente el Monitor CSI (Comércio e Inteligência de Subprodutos), una plataforma digital de seguimiento en tiempo real de las exportaciones brasileñas de harinas y grasas animales.",
          "La herramienta integra datos directamente del sistema de aduanas brasileño (Siscomex) y los cruza con información de producción reportada por las 280 plantas de rendering asociadas a ABRA. Esta integración permite visualizar flujos de exportación con una latencia máxima de 48 horas.",
        ],
      },
      {
        subtitle: "Inteligencia competitiva para un sector de $2.1 mil millones",
        paragraphs: [
          "\"El sector de rendering brasileño exporta más de $2.1 mil millones de dólares anuales y emplea a 85,000 personas. Sin embargo, la toma de decisiones estratégicas se veía limitada por la falta de visibilidad en tiempo real del comportamiento exportador. El Monitor CSI resuelve esta brecha\", declaró el director ejecutivo de ABRA.",
          "La plataforma incluye dashboards de inteligencia competitiva que permiten a los usuarios comparar su desempeño exportador contra promedios sectoriales, analizar tendencias de precios FOB por destino, y recibir alertas automáticas sobre cambios regulatorios en los principales mercados de importación.",
        ],
      },
    ],
  },
  {
    id: 11,
    title: "EE.UU.: 2024 fue un año récord para las exportaciones de carne de cerdo",
    summary: "Estados Unidos exportó 3.02 millones de toneladas de carne de cerdo en 2024, un nuevo récord histórico. China, México y Japón lideraron los destinos. El crecimiento del 7% interanual refleja la competitividad del sector porcícola norteamericano.",
    categories: ["Meat", "Commodities"],
    image: "assets/chicken_meat_bg.webp",
    industry: "chicken_meat",
    date: "2026-04-05",
    readingTime: 4,
    sections: [
      {
        subtitle: "Un récord que supera al máximo de 2019",
        paragraphs: [
          "El Departamento de Agricultura de Estados Unidos (USDA) confirmó que las exportaciones de carne de cerdo del país alcanzaron 3.02 millones de toneladas métricas en 2024, estableciendo un nuevo récord histórico que supera el anterior máximo de 2019 por un margen de 8%.",
          "China, México y Japón mantuvieron su posición como los tres principales mercados de destino, combinando el 62% del volumen total exportado. México registró el crecimiento más pronunciado, con un aumento del 14% interanual, impulsado por la recuperación del peso frente al dólar y el crecimiento sostenido de la demanda de cortes de valor agregado.",
        ],
      },
      {
        subtitle: "Perspectivas para 2025",
        paragraphs: [
          "El crecimiento del 7% interanual en exportaciones refleja una confluencia de factores: eficiencias productivas logradas mediante la adopción generalizada de tecnologías de gestión de granjas, una política comercial agresiva del Departamento de Comercio, y la recuperación de los mercados asiáticos tras las restricciones sanitarias de años anteriores.",
          "Analistas de mercado proyectan que el volumen exportable continuará expandiéndose en 2025, aunque a un ritmo más moderado del 3–4%, dada la creciente competencia de exportadores brasileños y europeos en los mercados de Asia Oriental.",
        ],
      },
    ],
  },
  {
    id: 12,
    title: "Inteligencia artificial en la industria de las mascotas: del diagnóstico nutricional a la personalización genómica",
    summary: 'Empresas líderes de petfood integran IA generativa para formular alimentos personalizados según raza, edad, condición corporal y análisis genómico. El mercado de "precision nutrition" para animales superará los $800M en 2027.',
    categories: ["Innovation", "Pet Food"],
    image: "assets/petfood.webp",
    industry: "petfood",
    date: "2026-03-28",
    readingTime: 5,
    sections: [
      {
        subtitle: "De la fórmula estándar a la nutrición hiperpersonalizada",
        paragraphs: [
          "La convergencia entre inteligencia artificial y nutrición animal está redefiniendo el paradigma de formulación de alimentos para mascotas, transformando lo que durante décadas fue un proceso estandarizado en una experiencia hiperpersonalizada basada en datos.",
          "Empresas líderes como Mars Petcare, Nestlé Purina y Hill's Pet Nutrition han invertido colectivamente más de $340 millones en desarrollo de plataformas de IA generativa durante los últimos 18 meses. Estos sistemas analizan perfiles genómicos, historiales médicos, datos de actividad de wearables y preferencias alimentarias para generar recomendaciones nutricionales individuales.",
        ],
      },
      {
        subtitle: "Nutrigenómica: el segmento de mayor margen",
        paragraphs: [
          "La tecnología más disruptiva emerge del campo de la nutrigenómica: algoritmos que correlacionan variantes genéticas específicas con requerimientos nutricionales óptimos. Por ejemplo, ciertas razas de perros presentan polimorfismos en genes relacionados con el metabolismo de taurina que afectan sus necesidades de aminoácidos sulfurosos.",
          "El mercado global de \"precision nutrition\" para animales de compañía está proyectado a superar los $800 millones para 2027, con una tasa de crecimiento anual compuesta del 24%. Este segmento, aunque aún representa menos del 3% del mercado total de petfood, concentra los márgenes más altos de la industria.",
        ],
      },
    ],
  },
];

export const TRENDING: Trending[] = [
  { topic: "UCO & SAF Feedstocks",       count: 47, delta: "+12%", up: true  },
  { topic: "China Soy Imports",          count: 38, delta: "+8%",  up: true  },
  { topic: "Insect Protein Scale-Up",    count: 31, delta: "+5%",  up: true  },
  { topic: "Rendering Circular Economy", count: 28, delta: "+3%",  up: true  },
  { topic: "LatAm Pet Food Growth",      count: 24, delta: "-2%",  up: false },
  { topic: "AI in Feed Formulation",     count: 21, delta: "+9%",  up: true  },
];
