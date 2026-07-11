// Canvas glyph placement that ignores font line metrics.
//
// textAlign 'center' + textBaseline 'middle' center the glyph on its ADVANCE
// WIDTH and FONT METRICS — but Thai fonts (especially iOS's Thonburi) carry
// huge ascent/descent to make room for stacked vowel/tone marks, so 'middle'
// lands far from the visual middle and big glyphs render shifted and cropped.
// Instead we measure the glyph's actual ink bounding box and center THAT.

export const THAI_CANVAS_FONT = '"Noto Sans Thai", "Thonburi", -apple-system, sans-serif';

export interface GlyphPlacement {
  font: string;
  x: number;
  y: number;
}

// Compute font + draw position so `char`'s ink box is centered in a w×w
// canvas, occupying at most `fill` of it. Sets ctx.font/textAlign/
// textBaseline; afterwards call fillText/strokeText(char, x, y) directly.
export function placeGlyph(
  ctx: CanvasRenderingContext2D,
  char: string,
  w: number,
  weight = 400,
  fill = 0.68,
): GlyphPlacement {
  const base = Math.max(10, Math.floor(w * 0.5));
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${weight} ${base}px ${THAI_CANVAS_FONT}`;
  let m = ctx.measureText(char);

  const inkW0 = (m.actualBoundingBoxLeft ?? NaN) + (m.actualBoundingBoxRight ?? NaN);
  const inkH0 = (m.actualBoundingBoxAscent ?? NaN) + (m.actualBoundingBoxDescent ?? NaN);
  if (!Number.isFinite(inkW0) || !Number.isFinite(inkH0) || inkW0 <= 0 || inkH0 <= 0) {
    // Ancient browser without actualBoundingBox — fall back to metric centering.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const font = `${weight} ${Math.floor(w * 0.6)}px ${THAI_CANVAS_FONT}`;
    ctx.font = font;
    return { font, x: w / 2, y: w / 2 };
  }

  // Scale the font so the ink box fits, then re-measure at the final size
  // (metrics are ~linear, but re-measuring avoids rounding drift).
  const scale = (w * fill) / Math.max(inkW0, inkH0);
  const fontSize = Math.max(10, Math.floor(base * scale));
  const font = `${weight} ${fontSize}px ${THAI_CANVAS_FONT}`;
  ctx.font = font;
  m = ctx.measureText(char);
  const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;

  // Pen position that puts the ink box's center at the canvas center.
  const x = w / 2 - inkW / 2 + m.actualBoundingBoxLeft;
  const y = w / 2 - inkH / 2 + m.actualBoundingBoxAscent;
  return { font, x, y };
}
