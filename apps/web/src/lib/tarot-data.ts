/**
 * The tarot room, v1: the 22 major arcana with upright/reversed keynotes in
 * the House's liberatory voice, plus the House's own divinity message cards
 * (oracle-style). Minor arcana (with their decans) arrive with the full deck.
 */

export interface TarotCard {
  n: number;
  name: string;
  glyph: string;
  upright: string;
  reversed: string;
  message: string;
}

export const MAJOR_ARCANA: TarotCard[] = [
  { n: 0, name: "The Fool", glyph: "☉", upright: "Beginnings, holy naivety, the leap", reversed: "Hesitation at the cliff, recklessness wearing freedom's coat", message: "You don't need the whole map. You need one honest step, and the sky's own appetite for beginnings." },
  { n: 1, name: "The Magician", glyph: "☿", upright: "Will, craft, as above so below", reversed: "Scattered talent, sleight of hand on yourself", message: "Everything on your table is already enough. Name what you're making and pick the tools up." },
  { n: 2, name: "The High Priestess", glyph: "☽", upright: "The knowing behind the veil, stillness, moon-wisdom", reversed: "Secrets kept from yourself, intuition shouted down", message: "You already know. The work this week is not learning — it's admitting." },
  { n: 3, name: "The Empress", glyph: "♀", upright: "Abundance, embodiment, creation that feeds", reversed: "Depletion dressed as generosity, the garden untended", message: "Softness is a technology. Feed the body first; the empire grows from there." },
  { n: 4, name: "The Emperor", glyph: "♈", upright: "Structure, sovereignty, the protected border", reversed: "Control without care, thrones built on fear", message: "Rule your own hours before you rule anything else. Boundaries are how love holds shape." },
  { n: 5, name: "The Hierophant", glyph: "♉", upright: "Lineage, teaching, the keys handed down", reversed: "Dogma over truth, permission-seeking", message: "Honor the teachers — then teach it your way. Tradition is a living thing or it is nothing." },
  { n: 6, name: "The Lovers", glyph: "♊", upright: "Choice, union, values made visible", reversed: "The unmade choice, harmony bought with silence", message: "Love is a decision repeated daily. Choose the life that lets all of you attend." },
  { n: 7, name: "The Chariot", glyph: "♋", upright: "Momentum, armored tenderness, victory by will", reversed: "Wheels spinning, drive without direction", message: "You've been pulling in two directions and calling it balance. Pick the road. Go." },
  { n: 8, name: "Strength", glyph: "♌", upright: "Gentle power, the lion befriended", reversed: "Force where patience was owed, the lion caged", message: "What growls in you doesn't need taming — it needs your calm hand and honest respect." },
  { n: 9, name: "The Hermit", glyph: "♍", upright: "Retreat, the inner lamp, wisdom in solitude", reversed: "Isolation past its healing point", message: "Go inward on purpose, not in exile. Take the lamp; leave the door unlocked." },
  { n: 10, name: "Wheel of Fortune", glyph: "♃", upright: "Turning luck, cycles, the hinge of fate", reversed: "Clinging to the down-turn, resisting the season", message: "The wheel doesn't ask permission. Ride the turn — what falls away was ballast." },
  { n: 11, name: "Justice", glyph: "♎", upright: "Truth, balance, the account settled", reversed: "The thumb on the scale, avoided reckonings", message: "Tell the truth first to yourself. The scales in your hands are steadier than you think." },
  { n: 12, name: "The Hanged One", glyph: "♆", upright: "Sacred pause, the view from upside-down", reversed: "Martyrdom on a schedule, stalling as surrender", message: "Stop struggling for one breath. The answer only appears from the angle you're avoiding." },
  { n: 13, name: "Death", glyph: "♏", upright: "Ending as passage, the compost of becoming", reversed: "The ending refused, the door held shut", message: "Let it end. You are not losing a life — you are making room for the one that fits." },
  { n: 14, name: "Temperance", glyph: "♐", upright: "Alchemy, patience, the middle way that shimmers", reversed: "Extremes trading places, the mix rushed", message: "Blend, don't choose. Your medicine is made of two things everyone said don't mix." },
  { n: 15, name: "The Devil", glyph: "♑", upright: "The chain examined, appetite made conscious", reversed: "The chain discovered loose all along", message: "Look directly at what binds you. Half of it is real; the other half is a story with your voice." },
  { n: 16, name: "The Tower", glyph: "♂", upright: "Necessary lightning, the false structure falls", reversed: "Dodging the collapse, renovation of the doomed", message: "What's shaking was never load-bearing for your real life. Let the lightning do its kindness." },
  { n: 17, name: "The Star", glyph: "♒", upright: "Renewal, guidance, water poured freely", reversed: "Hope withheld, the cup guarded", message: "Pour anyway. The night is listening, and your particular light is a navigation aid for someone." },
  { n: 18, name: "The Moon", glyph: "♓", upright: "Dream-logic, the path through uncertainty", reversed: "Fog mistaken for fate, fear's theater", message: "Not everything unclear is unsafe. Walk slowly; let the moon teach your eyes." },
  { n: 19, name: "The Sun", glyph: "☉", upright: "Joy unhidden, vitality, the child's yes", reversed: "Dimming to be palatable, joy postponed", message: "Delight is not a reward for finished work — it's fuel. Stand where the light already is." },
  { n: 20, name: "Judgement", glyph: "♇", upright: "The wake-up call, rising to your name", reversed: "The call screened, old verdicts replayed", message: "You are being called by your true name. Answer with the whole chest." },
  { n: 21, name: "The World", glyph: "♄", upright: "Completion, integration, the dance at the center", reversed: "The last step unwalked, closure feared", message: "Finish it — sign it, ship it, kiss it goodbye. The next circle can't open until this one closes." },
];

export interface MessageCard {
  title: string;
  message: string;
}

/** The House's divinity message cards — blessings in Alexandria's voice. */
export const MESSAGE_CARDS: MessageCard[] = [
  { title: "You are the altar", message: "You don't need to earn the sacred. Your body — exactly as it is today — is already the temple the ritual happens in." },
  { title: "The ancestors are not confused by you", message: "Whoever taught the world to doubt you did not consult your lineage. Somewhere back the line, someone with your laugh is proud." },
  { title: "Softness is strategy", message: "The world mistakes hardness for strength. You know better: water wins. Stay tender on purpose." },
  { title: "Your no is holy", message: "Every no you speak builds the room where your yes can finally live. Decline something this week and call it devotion." },
  { title: "The becoming is the point", message: "You are not late. You are not behind. You are in the exact chapter where the character learns the thing." },
  { title: "Rest is resistance", message: "They profit when you're exhausted. Your nap is political. Your slowness is a sanctuary. Lie down like it's liturgy." },
  { title: "You were never too much", message: "You were poured for a bigger cup. Stop decanting yourself for containers that were always the wrong size." },
  { title: "The dolls are divine", message: "Transformation is the oldest holy act — every deity worth their salt has changed form. You're in excellent company." },
  { title: "Ask the Moon", message: "When the mind spins, take it outside. The Moon has been managing cycles since before deadlines existed; let her mentor you." },
  { title: "Protection is present", message: "You are not walking alone tonight. Name your protectors — planetary, ancestral, chosen family — and walk like they're beside you. They are." },
  { title: "Abundance recognizes you", message: "What's meant for you is not confused about the address. Keep the porch light on: stay visible, stay soft, stay ready to receive." },
  { title: "Your anger is information", message: "Rage is love's bodyguard. Don't shame it — debrief it. Ask what it was protecting, then act with its precision and none of its shrapnel." },
  { title: "Begin before ready", message: "Readiness is a story told by fear with a clipboard. Begin scrappy. Begin scared. The sky has never once waited to be ready to dawn." },
  { title: "You are the good news", message: "Somewhere, someone's prayer looks exactly like you showing up as yourself. Don't edit the answer." },
];
