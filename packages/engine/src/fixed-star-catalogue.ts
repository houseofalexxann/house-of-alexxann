/**
 * The catalogue of fixed stars the House reads: fifty stars used across the
 * Western tradition, from the four Royal Stars to Orion's belt and the
 * southern sky. J2000.0 coordinates were collected twice, independently,
 * from SIMBAD and the Bright Star Catalogue (via the stars' Wikipedia
 * entries) and reconciled; natures follow Ptolemy as relayed by Vivian
 * Robson (1923); keynotes are the House's own short paraphrases of the
 * tradition, written as themes rather than verdicts.
 *
 * Kept as a plain table so any star can be checked line by line.
 */
import type { FixedStar } from "./types";

export const FIXED_STAR_CATALOGUE: FixedStar[] = [
  { name: "Algol", bayer: "β Persei", constellation: "Perseus", raDeg: 47.0422, decDeg: 40.9556, magnitude: 2.12, nature: "Saturn, Jupiter", keynote: "Intensity and rawness. The old texts feared it; modern readers see fierce, protective power." },
  { name: "Alcyone", bayer: "η Tauri", constellation: "Taurus", raDeg: 56.8712, decDeg: 24.1051, magnitude: 2.87, nature: "Moon, Mars", keynote: "The Pleiades: vision and ambition, something to weep for and something to see clearly." },
  { name: "Aldebaran", bayer: "α Tauri", constellation: "Taurus", raDeg: 68.9802, decDeg: 16.5093, magnitude: 0.86, nature: "Mars", keynote: "The Watcher of the East: integrity and honour, success that asks to be kept clean." },
  { name: "Rigel", bayer: "β Orionis", constellation: "Orion", raDeg: 78.6345, decDeg: -8.2016, magnitude: 0.13, nature: "Jupiter, Saturn", keynote: "Teaching and generosity, knowledge that lifts others, honours through skill." },
  { name: "Bellatrix", bayer: "γ Orionis", constellation: "Orion", raDeg: 81.2828, decDeg: 6.3497, magnitude: 1.64, nature: "Mars, Mercury", keynote: "Quick decisions, honours won in the open, a sharp tongue that needs care." },
  { name: "Capella", bayer: "α Aurigae", constellation: "Auriga", raDeg: 79.1723, decDeg: 45.998, magnitude: 0.08, nature: "Mars, Mercury", keynote: "Curiosity that will not sit still: freedom, learning, restlessness as a gift." },
  { name: "Betelgeuse", bayer: "α Orionis", constellation: "Orion", raDeg: 88.7929, decDeg: 7.4071, magnitude: 0.5, nature: "Mars, Mercury", keynote: "Lasting success and honours; the tradition counts it among the most fortunate stars." },
  { name: "Sirius", bayer: "α Canis Majoris", constellation: "Canis Major", raDeg: 101.2872, decDeg: -16.7161, magnitude: -1.46, nature: "Jupiter, Mars", keynote: "Brilliance and renown. The brightest star asks for a big life, and burns if rushed." },
  { name: "Canopus", bayer: "α Carinae", constellation: "Carina", raDeg: 95.988, decDeg: -52.6957, magnitude: -0.74, nature: "Saturn, Jupiter", keynote: "Voyages and broad knowledge: the navigator's star, steady and far-seeing." },
  { name: "Castor", bayer: "α Geminorum", constellation: "Gemini", raDeg: 113.6494, decDeg: 31.8883, magnitude: 1.58, nature: "Mercury", keynote: "The mortal twin: keen intellect, writing, sudden turns between gain and loss." },
  { name: "Pollux", bayer: "β Geminorum", constellation: "Gemini", raDeg: 116.329, decDeg: 28.0262, magnitude: 1.14, nature: "Mars", keynote: "The immortal twin: courage, fierce loyalty, a temper worth knowing about." },
  { name: "Procyon", bayer: "α Canis Minoris", constellation: "Canis Minor", raDeg: 114.8255, decDeg: 5.225, magnitude: 0.34, nature: "Mercury, Mars", keynote: "Quick rises that ask for follow-through; luck that must be tended." },
  { name: "Alphard", bayer: "α Hydrae", constellation: "Hydra", raDeg: 141.8968, decDeg: -8.6586, magnitude: 2, nature: "Saturn, Venus", keynote: "The heart of the serpent: wisdom, artistry, and passions that run strong." },
  { name: "Regulus", bayer: "α Leonis", constellation: "Leo", raDeg: 152.093, decDeg: 11.9672, magnitude: 1.4, nature: "Mars, Jupiter", keynote: "The heart of the Lion: leadership and honour, success that endures only without revenge." },
  { name: "Denebola", bayer: "β Leonis", constellation: "Leo", raDeg: 177.2649, decDeg: 14.5721, magnitude: 2.14, nature: "Saturn, Venus", keynote: "Quick judgement and generosity; the outsider who sees what the crowd misses." },
  { name: "Vindemiatrix", bayer: "ε Virginis", constellation: "Virgo", raDeg: 195.5442, decDeg: 10.9592, magnitude: 2.83, nature: "Saturn, Mercury", keynote: "The grape gatherer: harvest and timing, and the losses that come from picking too soon." },
  { name: "Algorab", bayer: "δ Corvi", constellation: "Corvus", raDeg: 187.4661, decDeg: -16.5154, magnitude: 2.96, nature: "Mars, Saturn", keynote: "The raven's wing: cunning, resilience, gathering what others discard." },
  { name: "Spica", bayer: "α Virginis", constellation: "Virgo", raDeg: 201.2982, decDeg: -11.1613, magnitude: 0.97, nature: "Venus, Mars", keynote: "The gift: talent that flows without effort, brilliance in art and science." },
  { name: "Arcturus", bayer: "α Boötis", constellation: "Boötes", raDeg: 213.9154, decDeg: 19.1822, magnitude: -0.05, nature: "Mars, Jupiter", keynote: "Renown through leadership and travel; the pathfinder's star." },
  { name: "Zubenelgenubi", bayer: "α2 Librae", constellation: "Libra", raDeg: 222.7196, decDeg: -16.0418, magnitude: 2.75, nature: "Saturn, Mars", keynote: "The southern scale: social reform and the cost of it, justice weighed the hard way." },
  { name: "Zubeneschamali", bayer: "β Librae", constellation: "Libra", raDeg: 229.2517, decDeg: -9.3829, magnitude: 2.61, nature: "Jupiter, Mercury", keynote: "The northern scale: honour, ambition, and a happier balance." },
  { name: "Alphecca", bayer: "α Coronae Borealis", constellation: "Corona Borealis", raDeg: 233.672, decDeg: 26.7147, magnitude: 2.24, nature: "Venus, Mercury", keynote: "The crown: dignity, art and poetry, a gift with a quiet price." },
  { name: "Antares", bayer: "α Scorpii", constellation: "Scorpius", raDeg: 247.3519, decDeg: -26.432, magnitude: 0.96, nature: "Mars, Jupiter", keynote: "The Watcher of the West: intensity, obsession, courage against the dark." },
  { name: "Rasalhague", bayer: "α Ophiuchi", constellation: "Ophiuchus", raDeg: 263.7336, decDeg: 12.56, magnitude: 2.07, nature: "Saturn, Venus", keynote: "The head of the healer: medicine and remedy, the one who tends the wound." },
  { name: "Vega", bayer: "α Lyrae", constellation: "Lyra", raDeg: 279.2347, decDeg: 38.7837, magnitude: 0.03, nature: "Venus, Mercury", keynote: "The harp: charm, artistry, a public presence, idealism to keep grounded." },
  { name: "Altair", bayer: "α Aquilae", constellation: "Aquila", raDeg: 297.6958, decDeg: 8.8683, magnitude: 0.76, nature: "Mars, Jupiter", keynote: "The eagle: boldness, ambition, sudden rises, courage in the open." },
  { name: "Deneb Algedi", bayer: "δ Capricorni", constellation: "Capricornus", raDeg: 326.7602, decDeg: -16.1273, magnitude: 2.81, nature: "Saturn, Jupiter", keynote: "The sea goat's tail: law, justice, and the wise old counsel of the tradition." },
  { name: "Fomalhaut", bayer: "α Piscis Austrini", constellation: "Piscis Austrinus", raDeg: 344.4127, decDeg: -29.6222, magnitude: 1.16, nature: "Venus, Mercury", keynote: "The Watcher of the South: ideals and fame, and the fall the tradition warns of when an ideal is sold." },
  { name: "Deneb", bayer: "α Cygni", constellation: "Cygnus", raDeg: 310.3579, decDeg: 45.2803, magnitude: 1.25, nature: "Venus, Mercury", keynote: "The swan's tail: a quick mind, ingenuity, a gift for shaping things." },
  { name: "Achernar", bayer: "α Eridani", constellation: "Eridanus", raDeg: 24.4285, decDeg: -57.2368, magnitude: 0.46, nature: "Jupiter", keynote: "The river's end: faith and generosity, endings that turn into new ground." },
  { name: "Markab", bayer: "α Pegasi", constellation: "Pegasus", raDeg: 346.1902, decDeg: 15.2053, magnitude: 2.48, nature: "Mars, Mercury", keynote: "The horse's saddle: steadiness under pressure, honours, the risk of overreach." },
  { name: "Scheat", bayer: "β Pegasi", constellation: "Pegasus", raDeg: 345.9436, decDeg: 28.0828, magnitude: 2.42, nature: "Mars, Mercury", keynote: "The horse's shoulder: imagination and storms; the tradition reads it with care around water." },
  { name: "Hamal", bayer: "α Arietis", constellation: "Aries", raDeg: 31.7934, decDeg: 23.4624, magnitude: 2, nature: "Mars, Saturn", keynote: "The ram's head: independence and drive, the headstrong start of things." },
  { name: "Mirach", bayer: "β Andromedae", constellation: "Andromeda", raDeg: 17.433, decDeg: 35.6205, magnitude: 2.05, nature: "Venus", keynote: "Andromeda's girdle: beauty, love, harmony, the pull of home and partner." },
  { name: "Menkar", bayer: "α Ceti", constellation: "Cetus", raDeg: 45.5699, decDeg: 4.0897, magnitude: 2.53, nature: "Saturn", keynote: "The whale's jaw: legacy and burden, what the collective hands you to carry." },
  { name: "Alhena", bayer: "γ Geminorum", constellation: "Gemini", raDeg: 99.428, decDeg: 16.3993, magnitude: 1.92, nature: "Mercury, Venus", keynote: "The proud march: purpose and mission, a wound to the foot that becomes a path." },
  { name: "Rasalgethi", bayer: "α Herculis", constellation: "Hercules", raDeg: 258.6619, decDeg: 14.3904, magnitude: 3.33, nature: "Mercury", keynote: "The kneeler's head: strength through humility, the labour that ennobles." },
  { name: "Sabik", bayer: "η Ophiuchi", constellation: "Ophiuchus", raDeg: 257.5945, decDeg: -15.7249, magnitude: 2.43, nature: "Saturn, Venus", keynote: "The healer's knee: honesty tested, a morality that must be chosen." },
  { name: "Facies (M22)", bayer: "NGC 6656 / M22 (globular cluster, no Bayer)", constellation: "Sagittarius", raDeg: 279.0998, decDeg: -23.9047, magnitude: 5.1, nature: "Sun, Mars", keynote: "The archer's stare: ruthless focus and precision, aim that must be aimed well." },
  { name: "Nunki", bayer: "σ Sagittarii", constellation: "Sagittarius", raDeg: 283.8164, decDeg: -26.2967, magnitude: 2.05, nature: "Jupiter, Mercury", keynote: "The vane of the arrow: truth-telling, authority, the will to speak plainly." },
  { name: "Toliman (Alpha Centauri)", bayer: "α Centauri (AB system)", constellation: "Centaurus", raDeg: 219.9021, decDeg: -60.834, magnitude: -0.27, nature: "Venus, Jupiter", keynote: "The centaur's foot: learning through friendship, mentors, the wise teacher." },
  { name: "Agena (Hadar)", bayer: "β Centauri", constellation: "Centaurus", raDeg: 210.9559, decDeg: -60.373, magnitude: 0.61, nature: "Venus, Jupiter", keynote: "The centaur's knee: honour, friendship, refinement." },
  { name: "Acrux", bayer: "α Crucis", constellation: "Crux", raDeg: 186.6496, decDeg: -63.0991, magnitude: 0.76, nature: "Jupiter", keynote: "The Southern Cross: devotion as a compass, the religious and the steadfast." },
  { name: "Mimosa (Becrux)", bayer: "β Crucis", constellation: "Crux", raDeg: 191.9303, decDeg: -59.6888, magnitude: 1.25, nature: "Jupiter", keynote: "The Southern Cross: deep spirituality and the courage to keep faith." },
  { name: "Alnilam", bayer: "ε Orionis", constellation: "Orion", raDeg: 84.0534, decDeg: -1.2019, magnitude: 1.69, nature: "Jupiter, Saturn", keynote: "Orion's belt: brief fame and honours, the swift and the fleeting." },
  { name: "Alnitak", bayer: "ζ Orionis", constellation: "Orion", raDeg: 85.1897, decDeg: -1.9429, magnitude: 1.77, nature: "Jupiter, Saturn", keynote: "Orion's belt: fame, bold ventures, a pull toward the public eye." },
  { name: "Mintaka", bayer: "δ Orionis", constellation: "Orion", raDeg: 83.0017, decDeg: -0.2991, magnitude: 2.23, nature: "Saturn, Mercury", keynote: "Orion's belt: good fortune, patience rewarded, the steady worker's star." },
  { name: "Alkaid", bayer: "η Ursae Majoris", constellation: "Ursa Major", raDeg: 206.8852, decDeg: 49.3133, magnitude: 1.86, nature: "Mars", keynote: "The tip of the bear's tail: mourning and memory, the one who carries the story." },
  { name: "Dubhe", bayer: "α Ursae Majoris", constellation: "Ursa Major", raDeg: 165.932, decDeg: 61.751, magnitude: 1.79, nature: "Mars", keynote: "The bear's back: strength, protection, quiet nurturing power." },
  { name: "Polaris", bayer: "α Ursae Minoris", constellation: "Ursa Minor", raDeg: 37.9545, decDeg: 89.2641, magnitude: 1.98, nature: "Saturn, Venus", keynote: "The pole star: guidance and direction, the fixed point others steer by." },
];
