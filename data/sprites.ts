// Hand-authored pixel-art collection — Thai mythology theme.
// Each sprite: width/height in pixels, a palette (char -> color), and rows of chars.
// '.' = transparent. Rows are normalized to `w` by the renderer, so exact counts are forgiving.

export interface Sprite {
  w: number;
  h: number;
  palette: Record<string, string>;
  rows: string[];
}

// ── NAGA — the serpent guardian (mascot) ────────────────────────────────────
const NAGA_PAL = {
  o: '#0f3d22', g: '#2fb35a', l: '#79e89b', y: '#f5c518',
  w: '#ffffff', k: '#0d1117', r: '#ff5a5a',
};
export const naga: Sprite = {
  w: 16, h: 16, palette: NAGA_PAL,
  rows: [
    '......oooo......',
    '....ooyyyyoo....',
    '...oyyllllyyo...',
    '..ooggggggggoo..',
    '.ooggllllllggoo.',
    'ooggggggggggggoo',
    'ogggwwkggkwwgggo',
    'ogggwkkggkkwgggo',
    'oggggggrrggggggo',
    '.oggggggggggggo.',
    '..ooggggggggoo..',
    '...ooggggggoo...',
    '....ooggggoo....',
    '.....ooggoo.....',
    '....ooggggoo....',
    '...oooo..oooo...',
  ],
};

// Sleeping naga — shown when all caught up
export const nagaSleep: Sprite = {
  w: 16, h: 16, palette: { ...NAGA_PAL, z: '#bfe9cf' },
  rows: [
    '......oooo...z..',
    '....ooyyyyoo.z..',
    '...oyyllllyyozz.',
    '..ooggggggggoo..',
    '.ooggllllllggoo.',
    'ooggggggggggggoo',
    'ogggooggggoogggo',
    'oggggggggggggggo',
    'oggggggrrggggggo',
    '.oggggggggggggo.',
    '..ooggggggggoo..',
    '...ooggggggoo...',
    '....ooggggoo....',
    '.....ooggoo.....',
    '....ooggggoo....',
    '...oooo..oooo...',
  ],
};

// ── GARUDA — the golden divine bird (celebration) ───────────────────────────
export const garuda: Sprite = {
  w: 16, h: 16,
  palette: { o: '#7a4a00', y: '#ffcf33', l: '#fff0a0', r: '#e23b3b', w: '#ffffff', k: '#0d1117', b: '#c98a00' },
  rows: [
    '.......oo.......',
    '......oyyo......',
    '......oyyo......',
    '.....oyllyo.....',
    '..o..oywwyo..o..',
    '.oyo.oykkyo.oyo.',
    'oyyyooylloooyyyo',
    'oyllyoyyyyoyllyo',
    'oyllyyyyyyyyllyo',
    '.oyyyyyrryyyyyo.',
    '..oyyyyrryyyyo..',
    '...oyyyooyyyo...',
    '....oyyooyyo....',
    '.....oybboyo....',
    '......obbbo.....',
    '.......oo.......',
  ],
};

// ── ELEPHANT — Chang, symbol of Thailand ────────────────────────────────────
export const elephant: Sprite = {
  w: 16, h: 16,
  // Side view (ref: classic pixel elephant): hanging trunk with a curl,
  // ear patch, eye + cheek, chunky legs, tail nub.
  palette: { o: '#3a3a44', g: '#9aa3b3', l: '#c2cad6', d: '#7b8496', k: '#0d1117', p: '#e08ab0' },
  rows: [
    '................',
    '....oooooooo....',
    '...ollllllllo...',
    '..ollllllllllo..',
    '.ollllddddlllo..',
    '.olkllddddllgo..',
    '.olgldddddgggoo.',
    '.opggddddggggoo.',
    '.ooggggggggggo..',
    '.ogogggggggggo..',
    '.ogogggggggggo..',
    '.ogooggggggggo..',
    '.ogoolgoolgooo..',
    '.oggo.oo..oo....',
    '..oo..oo..oo....',
    '................',
  ],
};

// ── HANUMAN — the white monkey warrior (hero) ───────────────────────────────
export const hanuman: Sprite = {
  w: 16, h: 16,
  palette: { o: '#4a4a4a', w: '#f4f4f4', l: '#ffffff', y: '#f5c518', k: '#0d1117', r: '#e23b3b', b: '#c98a00' },
  rows: [
    '......yyyy......',
    '.....yobboy.....',
    '....ywwwwwwy....',
    '...owllllllwo...',
    '..owlkwwwwklwo..',
    '..owwkwllwkwwo..',
    '..owwwwrrwwwwo..',
    '...owwwwwwwwo...',
    '..yoowwwwwwoooy.',
    '.yorowwwwwworoy.',
    'yo.rowwwwwwor.oy',
    '...rowwoowwor...',
    '...oowwo.owwoo..',
    '...owwo..owwo...',
    '...owo....owo...',
    '..ooo......ooo..',
  ],
};

// ── YAKSHA — the temple guardian giant (monster) ────────────────────────────
export const yaksha: Sprite = {
  w: 16, h: 16,
  palette: { o: '#10241a', g: '#3aa86a', l: '#67d699', y: '#f5c518', w: '#ffffff', k: '#0d1117', r: '#e23b3b' },
  rows: [
    '.....oyyyyo.....',
    '....oyllllyo....',
    '...oygggggggo...',
    '..oggllgggllggo.',
    '..oggggggggggo..',
    '.ogwwoggggowwgo.',
    '.ogwkogggggkwgo.',
    '.oggggggggggggo.',
    '.ogggggrrgggggo.',
    '.oggwkwkwkwkggo.',  // fanged grin
    '.oggwwwwwwwwggo.',
    '..oggggggggggo..',
    '...oggggggggo...',
    '..oo.oggggo.oo..',
    '.oyo..oooo..oyo.',
    '......o..o......',
  ],
};

// ── LOTUS — sacred flower (item) ────────────────────────────────────────────
export const lotus: Sprite = {
  w: 16, h: 13,
  palette: { o: '#7a2f50', p: '#ff8ac0', l: '#ffc2dd', y: '#f5c518', g: '#2fb35a', d: '#1f7a44' },
  rows: [
    '.......oo.......',
    '......oppo......',
    '...o..oppo..o...',
    '..opo.olpo.opo..',
    '.oplpooppooplpo.',
    'oplllopyypollllo',
    'opllppyyyyppllpo',
    '.opppyyyyyypppo.',
    '..oppyyyyyyppo..',
    '...oppppppppo...',
    '....dooooood....',
    '.....dggggd.....',
    '......dggd......',
  ],
};

// ── CHEDI — golden stupa (item / landmark) ──────────────────────────────────
export const chedi: Sprite = {
  w: 16, h: 18,
  palette: { o: '#7a5a00', y: '#f5c518', l: '#fff0a0', b: '#c98a00' },
  rows: [
    '.......oo.......',
    '.......yl.......',
    '......oyyl......',
    '......oyyl......',
    '.....oyyyyl.....',
    '.....oyllyl.....',
    '....oyyyyyyl....',
    '....oyllllyl....',
    '...oyyyyyyyyl...',
    '...oyllllllyl...',
    '..oyyyyyyyyyyl..',
    '..oylllllllyyl..',
    '.oyyyyyyyyyyyyl.',
    '.oyllllllllllyl.',
    'oyyyyyyyyyyyyyyl',
    'oybbbbbbbbbbbbyl',
    'oybbbbbbbbbbbbyl',
    'oooooooooooooooo',
  ],
};

// ── TEMPLE (WAT) — tiered roof hall (landscape) ─────────────────────────────
export const temple: Sprite = {
  w: 24, h: 16,
  palette: { o: '#5a2f10', r: '#c0392b', y: '#f5c518', c: '#efe2c0', k: '#3a2a18', b: '#8a5a2a', d: '#a13226' },
  rows: [
    '...........yy...........',
    '..........oyyo..........',
    '.........orrrro.........',
    '........orrrrrro........',
    '.......orrrrrrrro.......',
    '......orrrrrrrrrro......',
    '....yorrrrrrrrrrrroy....',
    '...orrrrrrrrrrrrrrrro...',
    '..orrrrrrrrrrrrrrrrrro..',
    '.oyyyyyyyyyyyyyyyyyyyyo.',
    '.occcccccccccccccccccco.',
    '.occcoccccooccccoccccco.',
    '.occcocckkoocccocccccco.',
    '.occcocckkoocccocccccco.',
    '.occcocckkoocccocccccco.',
    'oooooooooooooooooooooooo',
  ],
};

// ── PALM TREE (landscape) ───────────────────────────────────────────────────
export const palm: Sprite = {
  w: 12, h: 16,
  palette: { o: '#1f5a30', g: '#2fb35a', l: '#79e89b', t: '#8a5a2a', d: '#5a3a18', y: '#f5c518' },
  rows: [
    '...ogg..ggo.',
    '.ogllgooglgo',
    'oglllgggllgo',
    'oggllgyglllg',
    '.oggoyyyogo.',
    '...ooyyoo...',
    '.....td.....',
    '.....td.....',
    '.....td.....',
    '....td t....',
    '....td t....',
    '...td..t...',
    '...td..t...',
    '..td....t..',
    '..td....t..',
    '.oo......oo.',
  ],
};

// ── MOUNTAINS (wide landscape strip) ────────────────────────────────────────
export const mountains: Sprite = {
  w: 32, h: 12,
  palette: { o: '#23203a', m: '#3a3556', l: '#4a4566', s: '#cdd3e8', g: '#1f7a44' },
  rows: [
    '...............s................',
    '..............sls...............',
    '.....s.......slmls......s........',
    '....sls.....slmmmls....sls.......',
    '...slmls...slmmmmmls..slmls......',
    '..slmmmls.slmmmmmmmlsslmmmls.....',
    '.slmmmmmlslmmmmmmmmmllmmmmmls....',
    'slmmmmmmmlmmmmmmmmmmmlmmmmmmmls..',
    'lmmmmmmmmmmmmmmmmmmmmmmmmmmmmml..',
    'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm.',
    'gggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggg',
  ],
};

// ── CAT — gray sitting cat (reading scenes) ─────────────────────────────────
export const cat: Sprite = {
  w: 16, h: 16,
  palette: { o: '#2a2a33', g: '#8a8a99', l: '#b3b3c2', p: '#e89ab0', k: '#0d1117', w: '#ffffff' },
  rows: [
    '...o........o...',
    '...oo......oo...',
    '..oglo....olgo..',
    '..ogllggggllgo..',
    '..oglllllllllo..',
    '..oglkllllklgo..',
    '..ogllllllllgo..',
    '..oglllppllllo..',
    '..ogllwllwllgo..',
    '...oglllllllo...',
    '...ogggggggo....',
    '..ogggggggggo...',
    '..ogggggggggo...',
    '..oggggggggggo..',
    '..oglgggggglgo..',
    '..oooooooooooo..',
  ],
};

// ── GIRL — Manee-style child (reading scenes) ───────────────────────────────
export const girl: Sprite = {
  w: 16, h: 16,
  palette: { h: '#2a2230', s: '#f0c69a', g: '#3aa86a', p: '#c84a8a', k: '#0d1117', r: '#e08aa0' },
  rows: [
    '....hhhhhhhh....',
    '...hhhhhhhhhh...',
    '..hhhsssssshhh..',
    '..hhsssssssshh..',
    '..hssksssskssh..',
    '..hssssssssssh..',
    '..hssssrrssssh..',
    '...hhhhhhhhhh...',
    '....gggggggg....',
    '...gggggggggg...',
    '..gggggggggggg..',
    '...gggggggggg...',
    '....pppppppp....',
    '...pppppppppp...',
    '..pppppppppppp..',
    '...ss......ss...',
  ],
};

// ── SUN — small retro sun (reading scenes) ──────────────────────────────────
export const sun: Sprite = {
  w: 9, h: 9,
  palette: { y: '#ffcf33', o: '#f5a623' },
  rows: [
    '....o....',
    '.o.....o.',
    '...yyy...',
    '..yyyyy..',
    'o.yyyyy.o',
    '..yyyyy..',
    '...yyy...',
    '.o.....o.',
    '....o....',
  ],
};

export const SPRITES = {
  naga, nagaSleep, garuda, elephant, hanuman, yaksha,
  lotus, chedi, temple, palm, mountains, cat, girl, sun,
} as const;

export type SpriteName = keyof typeof SPRITES;
