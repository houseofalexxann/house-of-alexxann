/**
 * Site-chrome dictionaries (EN/ES/FR). v1 covers navigation, footer, and the
 * home hero; readings/interpretations remain English for now and say so in
 * the switcher. Keys are stable — add languages by adding a column.
 */
export type Locale = "en" | "es" | "fr";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.western": "Western",
  "nav.vedic": "Vedic",
  "nav.blog": "Blog",
  "nav.learn": "Learn",
  "nav.signIn": "Sign in",
  "nav.join": "Join the House",
  "nav.transits": "Transits",
  "nav.humanDesign": "Human Design",
  "nav.tarot": "Tarot",
  "footer.faq": "FAQ",
  "footer.donate": "Support the House",
  "nav.studio": "Chart Studio",
  "nav.readings": "Readings",
  "nav.codex": "Codex",
  "nav.about": "About",
  "nav.book": "Book a reading",
  "footer.explore": "Explore",
  "footer.yourData": "Your data",
  "footer.dataNote":
    "Birth date, time and place are sensitive personal data. Charts cast in the Studio are computed on request and never sold or shared; booking details are used only to prepare and deliver your reading.",
  "footer.tagline":
    "Professional astrology, cast with the precision of the Swiss Ephemeris and read with warmth. Western & Vedic charts, readings, and guidance.",
  "footer.pricing": "Readings & pricing",
  "footer.aboutAlexandria": "About Alexandria",
  "footer.accessibility": "Accessibility",
  "footer.crafted": "Crafted under night skies",
  "footer.langNote": "Readings are in English for now — more languages are coming.",
  "hero.kicker": "Western · Vedic · Modern & Mystical",
  "hero.title1": "The sky you were born under",
  "hero.title2": "still remembers you.",
  "hero.sub":
    "Cast your natal chart free — Western or Vedic, computed with professional-grade precision — then sit with Alexandria for a reading that makes it yours.",
  "hero.castFree": "Cast your chart — free",
  "hero.bookReading": "Book a reading",
};

const es: Dict = {
  "nav.western": "Occidental",
  "nav.vedic": "Védica",
  "nav.blog": "Blog",
  "nav.learn": "Aprende",
  "nav.signIn": "Inicia sesión",
  "nav.join": "Únete a la Casa",
  "nav.transits": "Tránsitos",
  "nav.humanDesign": "Diseño Humano",
  "nav.tarot": "Tarot",
  "footer.faq": "Preguntas frecuentes",
  "footer.donate": "Apoya la Casa",
  "nav.studio": "Estudio de cartas",
  "nav.readings": "Lecturas",
  "nav.codex": "Códice",
  "nav.about": "Sobre mí",
  "nav.book": "Reserva una lectura",
  "footer.explore": "Explora",
  "footer.yourData": "Tus datos",
  "footer.dataNote":
    "La fecha, hora y lugar de nacimiento son datos personales sensibles. Las cartas del Estudio se calculan a petición y nunca se venden ni se comparten; los datos de reserva se usan solo para preparar y entregar tu lectura.",
  "footer.tagline":
    "Astrología profesional, calculada con la precisión de las Efemérides Suizas y leída con calidez. Cartas occidentales y védicas, lecturas y guía.",
  "footer.pricing": "Lecturas y precios",
  "footer.aboutAlexandria": "Sobre Alexandria",
  "footer.accessibility": "Accesibilidad",
  "footer.crafted": "Creado bajo cielos nocturnos",
  "footer.langNote": "Las lecturas están en inglés por ahora — pronto habrá más idiomas.",
  "hero.kicker": "Occidental · Védica · Moderna y Mística",
  "hero.title1": "El cielo bajo el que naciste",
  "hero.title2": "todavía te recuerda.",
  "hero.sub":
    "Calcula tu carta natal gratis — occidental o védica, con precisión profesional — y luego siéntate con Alexandria para una lectura que la haga tuya.",
  "hero.castFree": "Calcula tu carta — gratis",
  "hero.bookReading": "Reserva una lectura",
};

const fr: Dict = {
  "nav.western": "Occidentale",
  "nav.vedic": "Védique",
  "nav.blog": "Blog",
  "nav.learn": "Apprendre",
  "nav.signIn": "Connexion",
  "nav.join": "Rejoindre la Maison",
  "nav.transits": "Transits",
  "nav.humanDesign": "Human Design",
  "nav.tarot": "Tarot",
  "footer.faq": "FAQ",
  "footer.donate": "Soutenir la Maison",
  "nav.studio": "Atelier des cartes",
  "nav.readings": "Lectures",
  "nav.codex": "Codex",
  "nav.about": "À propos",
  "nav.book": "Réserver une lecture",
  "footer.explore": "Explorer",
  "footer.yourData": "Vos données",
  "footer.dataNote":
    "La date, l'heure et le lieu de naissance sont des données personnelles sensibles. Les cartes de l'Atelier sont calculées à la demande et ne sont jamais vendues ni partagées ; les détails de réservation servent uniquement à préparer et livrer votre lecture.",
  "footer.tagline":
    "Astrologie professionnelle, calculée avec la précision des Éphémérides Suisses et lue avec chaleur. Cartes occidentales et védiques, lectures et guidance.",
  "footer.pricing": "Lectures et tarifs",
  "footer.aboutAlexandria": "À propos d'Alexandria",
  "footer.accessibility": "Accessibilité",
  "footer.crafted": "Façonné sous les ciels nocturnes",
  "footer.langNote": "Les lectures sont en anglais pour l'instant — d'autres langues arrivent.",
  "hero.kicker": "Occidentale · Védique · Moderne et Mystique",
  "hero.title1": "Le ciel sous lequel tu es né·e",
  "hero.title2": "se souvient encore de toi.",
  "hero.sub":
    "Calcule ta carte natale gratuitement — occidentale ou védique, avec une précision professionnelle — puis retrouve Alexandria pour une lecture qui te ressemble.",
  "hero.castFree": "Calcule ta carte — gratuit",
  "hero.bookReading": "Réserver une lecture",
};

export const DICTIONARIES: Record<Locale, Dict> = { en, es, fr };
