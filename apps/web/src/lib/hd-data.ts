/**
 * Human Design knowledge layer: the standard vocabulary (I-Ching-derived
 * gate names, channel names, center themes, types, authorities, profiles)
 * rendered in the House's plain, warm register.
 */

export const HD_CENTERS: Record<
  string,
  { label: string; theme: string; defined: string; open: string }
> = {
  head: {
    label: "Head",
    theme: "Pressure of inspiration — questions, wonder, the itch to know",
    defined: "You generate your own questions and inspiration; your wondering has a consistent flavor others can feel.",
    open: "You amplify the questions of everyone around you — brilliant at knowing which questions matter, when you don't treat them all as yours to answer.",
  },
  ajna: {
    label: "Ajna",
    theme: "Conceptualization — how thoughts become concepts and certainty",
    defined: "A fixed, reliable way of processing ideas; your certainty is real, though it isn't everyone's.",
    open: "You can think in every style and hold ideas without cementing them — wisdom about which concepts are actually useful.",
  },
  throat: {
    label: "Throat",
    theme: "Manifestation — speech and action; where everything wants to come out",
    defined: "A consistent voice; you speak and act from your own current.",
    open: "Your voice adapts to the room and carries others' words; learning when speaking is truly yours to do brings enormous freedom.",
  },
  g: {
    label: "G · Self",
    theme: "Identity, direction, love — the magnet of the self",
    defined: "A steady sense of who you are and where you're pointed, whatever the weather.",
    open: "Identity as art: you shapeshift by place and people, and place matters enormously — wisdom about direction and love without being fixed in one.",
  },
  ego: {
    label: "Ego · Heart",
    theme: "Willpower, worth, promises — the engine of proving",
    defined: "Real willpower in cycles of work and rest; make promises deliberately, because your word carries weight.",
    open: "Nothing to prove — though the world may bait you into trying; wisdom about worth and about who actually keeps their promises.",
  },
  sacral: {
    label: "Sacral",
    theme: "Life force — the responsive motor of energy and work",
    defined: "Renewable workforce energy that speaks in gut sounds: uh-huh, uh-uh. Respond, don't initiate, and the energy is endless.",
    open: "Not built for consistent output — you borrow and amplify sacral energy, can outwork anyone briefly, and must learn when enough is enough.",
  },
  solarPlexus: {
    label: "Solar Plexus",
    theme: "Emotions — waves of feeling, from hope to pain and back",
    defined: "You move in emotional waves: no truth in the now, clarity over time. Your feelings are weather with their own dignity — ride, don't rush.",
    open: "An empath's center: you feel the room's emotions louder than their owners do. Learning what's yours (usually: not much of it) changes everything.",
  },
  spleen: {
    label: "Spleen",
    theme: "Intuition, health, survival — the oldest animal knowing",
    defined: "A quiet, once-only intuitive whisper in real time; your sense of wellbeing and timing is trustworthy.",
    open: "You feel others' fears and health; don't hold on to what isn't yours, and never let fear (or its absence) make your decisions.",
  },
  root: {
    label: "Root",
    theme: "Pressure to act — adrenalized drive, stress as fuel",
    defined: "A steady pulse of pressure that fuels you on its own schedule.",
    open: "You amplify the room's urgency — the freedom is realizing you never have to hurry to get the pressure to stop.",
  },
};

/** I-Ching-derived gate keynames (standard HD vocabulary). */
export const HD_GATES: Record<number, string> = {
  1: "Self-Expression", 2: "Direction", 3: "Ordering", 4: "Formulization",
  5: "Fixed Rhythms", 6: "Friction", 7: "The Role of the Self", 8: "Contribution",
  9: "Focus", 10: "Behavior of the Self", 11: "Ideas", 12: "Caution",
  13: "The Listener", 14: "Power Skills", 15: "Extremes", 16: "Skills",
  17: "Opinions", 18: "Correction", 19: "Wanting", 20: "The Now",
  21: "The Hunter", 22: "Openness", 23: "Assimilation", 24: "Rationalization",
  25: "The Spirit of the Self", 26: "The Egoist", 27: "Caring", 28: "The Game Player",
  29: "Saying Yes", 30: "Feelings", 31: "Influence", 32: "Continuity",
  33: "Privacy", 34: "Power", 35: "Change", 36: "Crisis",
  37: "Friendship", 38: "The Fighter", 39: "Provocation", 40: "Aloneness",
  41: "Contraction", 42: "Growth", 43: "Insight", 44: "Alertness",
  45: "The Gatherer", 46: "Determination", 47: "Realization", 48: "Depth",
  49: "Principles", 50: "Values", 51: "Shock", 52: "Stillness",
  53: "Beginnings", 54: "Ambition", 55: "Spirit", 56: "Stimulation",
  57: "Intuitive Clarity", 58: "Vitality", 59: "Intimacy", 60: "Limitation",
  61: "Mystery", 62: "Details", 63: "Doubt", 64: "Confusion",
};

/** Channel names keyed "a-b" matching the engine's channel pairs. */
export const HD_CHANNELS: Record<string, string> = {
  "64-47": "Abstraction — mental activity & clarity",
  "61-24": "Awareness — the thinker",
  "63-4": "Logic — doubt to formula",
  "17-62": "Acceptance — the organizer",
  "43-23": "Structuring — genius to freak",
  "11-56": "Curiosity — the seeker",
  "16-48": "The Wavelength — talent",
  "20-57": "The Brainwave — penetrating awareness",
  "20-34": "Charisma — thought to deed",
  "20-10": "Awakening — commitment to higher principles",
  "31-7": "The Alpha — leadership",
  "8-1": "Inspiration — the creative role model",
  "33-13": "The Prodigal — the witness",
  "45-21": "The Money Line — material mastery",
  "35-36": "Transitoriness — the jack of all trades",
  "12-22": "Openness — the social being",
  "10-34": "Exploration — following one's convictions",
  "10-57": "Perfected Form — survival",
  "15-5": "Rhythm — being in the flow",
  "2-14": "The Beat — keeper of keys",
  "46-29": "Discovery — succeeding where others fail",
  "25-51": "Initiation — needing to be first",
  "26-44": "Surrender — the transmitter",
  "40-37": "Community — the bargain",
  "59-6": "Intimacy — focused on reproduction & closeness",
  "27-50": "Preservation — custodianship",
  "34-57": "Power — the archetype",
  "42-53": "Maturation — balanced development",
  "3-60": "Mutation — pulse of change",
  "9-52": "Concentration — determination",
  "32-54": "Transformation — being driven",
  "28-38": "Struggle — stubbornness toward purpose",
  "18-58": "Judgment — insatiable correction toward joy",
  "49-19": "Synthesis — sensitivity",
  "55-39": "Emoting — moodiness & spirit",
  "30-41": "Recognition — focused fantasy to feeling",
};

export const HD_TYPES: Record<
  string,
  { strategy: string; signature: string; notSelf: string; note: string }
> = {
  Generator: {
    strategy: "To respond",
    signature: "Satisfaction",
    notSelf: "Frustration",
    note: "The life force of the world. Your sacral speaks in yeses and noes to what shows up — follow the responses and the work of your life finds you.",
  },
  "Manifesting Generator": {
    strategy: "To respond, then inform",
    signature: "Satisfaction & peace",
    notSelf: "Frustration & anger",
    note: "A multi-passionate engine that skips steps and moves fast. Respond first, tell people before you act, and let quitting be a feature, not a failure.",
  },
  Manifestor: {
    strategy: "To inform before acting",
    signature: "Peace",
    notSelf: "Anger",
    note: "The initiator. You don't need permission — but informing the people in your impact zone keeps the road clear so your urges can move unresisted.",
  },
  Projector: {
    strategy: "To wait for the invitation",
    signature: "Success",
    notSelf: "Bitterness",
    note: "The guide. You see others more clearly than they see themselves; recognition and invitation are the doors your gifts walk through — rest is productive.",
  },
  Reflector: {
    strategy: "To wait a lunar cycle",
    signature: "Surprise & delight",
    notSelf: "Disappointment",
    note: "The mirror of the community — fully open, sampling everything. Big decisions ripen over a full Moon cycle; your consistency is the Moon herself.",
  },
};

export const HD_LINES: Record<number, string> = {
  1: "Investigator", 2: "Hermit", 3: "Martyr", 4: "Opportunist",
  5: "Heretic", 6: "Role Model",
};

export const HD_GLOSSARY: [string, string][] = [
  ["Type", "The five energy architectures (Generator, Manifesting Generator, Manifestor, Projector, Reflector) — each with its own aura, strategy, and way of exchanging energy with the world. Type is the first and most practical thing to experiment with."],
  ["Strategy", "Your type's mechanical way of meeting life with the least resistance — responding, informing, waiting for the invitation, or waiting a lunar cycle. Not a rule: an experiment with a felt result."],
  ["Authority", "Your body's decision-maker. Emotional (clarity over time), sacral (gut sounds in the now), splenic (one quiet whisper), ego, self-projected, mental sounding-board, or lunar — decisions made from authority feel different from decisions made from the mind."],
  ["Profile", "Two lines — your conscious Sun's line and your body's Sun's line — combining into one of twelve costumes (like 2/5 Hermit/Heretic): the way your purpose dresses itself in a life."],
  ["Personality & Design", "The two columns of the bodygraph. Personality (black) is the sky at birth — who you know yourself to be. Design (red) is the sky 88° of Sun earlier — the body's unconscious inheritance. You are the conversation between them."],
  ["Centers", "Nine hubs of energy. Defined (colored) centers are your consistent, reliable energy; open (white) centers are where you take in, amplify, and become wise about everyone else."],
  ["Channels", "Thirty-six circuits joining two gates across two centers. A complete channel defines both centers and adds a fixed life-theme to your design."],
  ["Gates", "Sixty-four openings, one per I-Ching hexagram, each carrying a keynote (Gate 34: Power; Gate 25: the Spirit of the Self). Planets sit in gates; gates seek their harmonic partner across the channel."],
  ["Lines", "Each gate divides into six lines — the flavor of how that gate plays (1 Investigator through 6 Role Model). Your profile is built from lines."],
  ["Definition", "How your defined centers connect: single (all one circuit), split, triple or quadruple split — describing whether you feel whole alone or seek bridges in others."],
  ["Not-self theme", "The signature feeling of living against your design (frustration, anger, bitterness, disappointment) — not a failure, a compass reading."],
  ["Signature", "The felt sense of living your design well: satisfaction, peace, success, delight. The experiment's proof."],
  ["Aura", "The energetic broadcast of your type — enveloping (Generator), repelling & impactful (Manifestor), focused & absorbing (Projector), sampling (Reflector). Auras do the talking before you do."],
  ["The 88 degrees", "The design chart is cast when the Sun sat exactly 88° behind its birth position — roughly 88 days before you were born: the body's prenatal imprint."],
];
