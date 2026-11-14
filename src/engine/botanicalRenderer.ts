import { CROPS } from '../data/cropsAndItems';
import { PlotState, WorldObject } from '../types/game';
import { TILE_SIZE } from './maps';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  wid: number,
  angle: number,
  fill: string,
  highlight?: string,
  outline = '#14532D'
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = fill;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -wid, len, 0);
  ctx.quadraticCurveTo(len * 0.5, wid, 0, 0);
  ctx.fill();
  ctx.stroke();

  if (highlight) {
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(len * 0.14, 0);
    ctx.lineTo(len * 0.82, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSeedStage(
  ctx: CanvasRenderingContext2D,
  cropId: string,
  cx: number,
  cy: number,
  watered: boolean
) {
  // Subtle soil mound cradling the planted seed
  ctx.fillStyle = watered ? 'rgba(30, 18, 10, 0.55)' : 'rgba(69, 43, 22, 0.5)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 7, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (cropId === 'padi_sawah' || cropId === 'kangkung') {
    // Mini irrigated puddle & scattered seeds/cuttings
    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, 15, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cropId === 'padi_sawah' ? '#EAB308' : '#34D399';
    for (const [ox, oy, ang] of [
      [-6, 5, -0.3],
      [0, 7, 0.2],
      [6, 4, 0.5],
      [-2, 3, -0.5],
    ]) {
      ctx.save();
      ctx.translate(cx + ox, cy + oy);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.8, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return;
  }

  if (cropId === 'singkong') {
    // Angled cassava woody stem cutting (stek batang)
    ctx.save();
    ctx.translate(cx, cy + 7);
    ctx.rotate(-0.25);
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1;
    roundRect(ctx, -2.5, -11, 5, 13, 1.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#84CC16';
    ctx.beginPath();
    ctx.arc(2.5, -8, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (cropId === 'bawang_merah' || cropId === 'talas') {
    // Planted crimson bulb or purple taro corm peeking out
    const bulbColor = cropId === 'bawang_merah' ? '#A21CAF' : '#7C3AED';
    const tipColor = cropId === 'bawang_merah' ? '#84CC16' : '#4ADE80';
    ctx.fillStyle = bulbColor;
    ctx.strokeStyle = '#3B0764';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy + 6, 4.2, 3.6, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 4, cy + 6.5, 3.8, 3.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = tipColor;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy + 3);
    ctx.lineTo(cx - 5, cy - 2);
    ctx.lineTo(cx - 2.5, cy + 3);
    ctx.moveTo(cx + 4, cy + 3.5);
    ctx.lineTo(cx + 5, cy - 1);
    ctx.lineTo(cx + 2.5, cy + 3.5);
    ctx.fill();
    return;
  }

  // Scattered seeds tailored by seed color
  const seedColor =
    cropId === 'jagung_manis'
      ? '#FACC15'
      : cropId === 'semangka'
      ? '#1E293B'
      : cropId === 'kacang_tanah'
      ? '#D97706'
      : cropId === 'kedelai'
      ? '#FDE047'
      : '#E7B98A';

  for (const [ox, oy, r] of [
    [-6, 5, 2.2],
    [0, 6.5, 2.4],
    [6, 4.5, 2.1],
    [-1, 2.5, 1.9],
  ]) {
    ctx.fillStyle = seedColor;
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx + ox, cy + oy, r + 0.5, r - 0.3, ox * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawSproutStage(
  ctx: CanvasRenderingContext2D,
  cropId: string,
  cx: number,
  cy: number,
  sway: number,
  sproutColor: string,
  leafColor: string
) {
  if (cropId === 'padi_sawah' || cropId === 'kangkung' || cropId === 'bawang_merah') {
    // Slender grass-like/tubular shoots
    ctx.strokeStyle = sproutColor;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (const ox of [-5, 0, 5]) {
      ctx.beginPath();
      ctx.moveTo(cx + ox, cy + 7);
      ctx.quadraticCurveTo(cx + ox + sway * 0.4, cy - 1, cx + ox * 1.2 + sway * 0.6, cy - 8);
      ctx.stroke();
    }
    return;
  }

  if (cropId === 'talas') {
    // Rolled young elephant ear bud + small heart leaf
    ctx.strokeStyle = '#15803D';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 8);
    ctx.lineTo(cx + sway * 0.4, cy - 4);
    ctx.stroke();
    ctx.fillStyle = sproutColor;
    ctx.beginPath();
    ctx.ellipse(cx + sway * 0.5, cy - 5, 5.5, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Stem + twin cotyledon leaves
  ctx.strokeStyle = leafColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy + 8);
  ctx.lineTo(cx + sway * 0.3, cy - 1);
  ctx.stroke();

  drawLeaf(ctx, cx + sway * 0.3, cy - 1, 9, 3.8, -2.55, sproutColor, '#BEF264');
  drawLeaf(ctx, cx + sway * 0.3, cy - 1, 9, 3.8, -0.58, sproutColor, '#BEF264');
}

function drawGrowingCrop(
  ctx: CanvasRenderingContext2D,
  cropId: string,
  cx: number,
  cy: number,
  sway: number,
  sprout: string,
  leaf: string
) {
  switch (cropId) {
    case 'jagung_manis': {
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.quadraticCurveTo(cx + sway * 0.4, cy - 4, cx + sway * 0.7, cy - 16);
      ctx.stroke();
      drawLeaf(ctx, cx, cy + 4, 14, 4.2, -2.7, leaf, sprout);
      drawLeaf(ctx, cx, cy + 2, 14, 4.2, -0.45, leaf, sprout);
      drawLeaf(ctx, cx + sway * 0.4, cy - 5, 13, 3.8, -2.5, sprout);
      drawLeaf(ctx, cx + sway * 0.4, cy - 6, 13, 3.8, -0.6, sprout);
      break;
    }
    case 'padi_sawah': {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = -3; i <= 3; i++) {
        ctx.strokeStyle = i % 2 === 0 ? leaf : sprout;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + i * 3, cy + 9);
        ctx.quadraticCurveTo(
          cx + i * 3.5 + sway * 0.5,
          cy - 2,
          cx + i * 4.5 + sway * 0.9,
          cy - 13 + Math.abs(i)
        );
        ctx.stroke();
      }
      break;
    }
    case 'kangkung': {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 15, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      for (const [ox, ang] of [
        [-7, -2.3],
        [-3, -1.9],
        [2, -1.3],
        [7, -0.8],
      ]) {
        drawLeaf(ctx, cx + ox * 0.5 + sway * 0.3, cy + 6, 14, 3.6, ang, leaf, sprout);
      }
      break;
    }
    case 'talas': {
      for (const [ox, oy, sz] of [
        [-7, -2, 8],
        [7, -1, 8],
        [0, -7, 10],
      ]) {
        ctx.strokeStyle = '#4D7C0F';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 9);
        ctx.lineTo(cx + ox + sway * 0.4, cy + oy);
        ctx.stroke();
        ctx.fillStyle = leaf;
        ctx.strokeStyle = '#064E3B';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx + ox + sway * 0.4, cy + oy - 2, sz, sz * 0.78, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case 'semangka': {
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - 13, cy + 7);
      ctx.quadraticCurveTo(cx, cy + 1, cx + 14 + sway * 0.3, cy + 6);
      ctx.stroke();
      drawLeaf(ctx, cx - 7, cy + 4, 10, 5, -2.2, leaf, sprout);
      drawLeaf(ctx, cx + 2, cy + 3, 10, 5, -0.9, leaf, sprout);
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(cx + 9 + sway * 0.3, cy + 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'tomat_lokal': {
      // Wooden trellis stake + climbing leafy vine
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx, cy - 15);
      ctx.stroke();
      drawLeaf(ctx, cx, cy + 3, 11, 4.5, -2.5, leaf, sprout);
      drawLeaf(ctx, cx, cy + 1, 11, 4.5, -0.6, leaf, sprout);
      drawLeaf(ctx, cx + sway * 0.3, cy - 7, 10, 4.2, -2.3, sprout);
      drawLeaf(ctx, cx + sway * 0.3, cy - 8, 10, 4.2, -0.8, sprout);
      break;
    }
    case 'singkong': {
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx + sway * 0.3, cy - 7);
      ctx.stroke();
      for (let a = 0; a < 5; a++) {
        const ang = -Math.PI * 0.9 + (a / 4) * Math.PI * 0.8;
        drawLeaf(ctx, cx + sway * 0.3, cy - 7, 11, 2.8, ang, leaf, sprout);
      }
      break;
    }
    case 'bawang_merah': {
      for (let i = -2; i <= 2; i++) {
        ctx.strokeStyle = i % 2 === 0 ? '#16A34A' : '#15803D';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + i * 3.2, cy + 9);
        ctx.quadraticCurveTo(
          cx + i * 3.8 + sway * 0.4,
          cy,
          cx + i * 4.5 + sway * 0.7,
          cy - 11 + Math.abs(i) * 1.5
        );
        ctx.stroke();
      }
      break;
    }
    default: {
      // Bushy herbs (Cabai, Kedelai, Kacang Tanah, Terong)
      ctx.strokeStyle = '#14532D';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 9);
      ctx.lineTo(cx + sway * 0.3, cy - 4);
      ctx.stroke();
      drawLeaf(ctx, cx + sway * 0.2, cy + 3, 11, 4.5, -2.6, leaf, sprout);
      drawLeaf(ctx, cx + sway * 0.2, cy + 3, 11, 4.5, -0.5, leaf, sprout);
      drawLeaf(ctx, cx + sway * 0.35, cy - 3, 11, 4.5, -2.2, sprout, '#BEF264');
      drawLeaf(ctx, cx + sway * 0.35, cy - 3, 11, 4.5, -0.9, sprout, '#BEF264');
      ctx.fillStyle = cropId === 'terong_ungu' ? '#C084FC' : '#FEF9C3';
      ctx.beginPath();
      ctx.arc(cx - 5 + sway * 0.3, cy - 5, 2.2, 0, Math.PI * 2);
      ctx.arc(cx + 5 + sway * 0.3, cy - 2, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawMatureCrop(
  ctx: CanvasRenderingContext2D,
  cropId: string,
  cx: number,
  cy: number,
  sway: number,
  sprout: string,
  leaf: string,
  fruit: string
) {
  switch (cropId) {
    case 'jagung_manis': {
      // Tall golden cornstalk + tassel + 2 cobs
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 11);
      ctx.quadraticCurveTo(cx + sway * 0.4, cy - 6, cx + sway * 0.7, cy - 21);
      ctx.stroke();
      // Golden tassel
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx + sway * 0.7, cy - 21);
      ctx.lineTo(cx - 4 + sway * 0.8, cy - 26);
      ctx.moveTo(cx + sway * 0.7, cy - 21);
      ctx.lineTo(cx + sway * 0.8, cy - 27);
      ctx.moveTo(cx + sway * 0.7, cy - 21);
      ctx.lineTo(cx + 4 + sway * 0.8, cy - 26);
      ctx.stroke();

      drawLeaf(ctx, cx, cy + 4, 15, 4.5, -2.7, leaf, sprout);
      drawLeaf(ctx, cx, cy + 2, 15, 4.5, -0.4, leaf, sprout);
      drawLeaf(ctx, cx + sway * 0.4, cy - 8, 13, 4, -2.4, sprout);
      drawLeaf(ctx, cx + sway * 0.4, cy - 9, 13, 4, -0.7, sprout);

      // Left & right golden corn cobs
      for (const [ox, oy, ang] of [
        [-6, -3, -0.45],
        [6, -6, 0.42],
      ]) {
        ctx.save();
        ctx.translate(cx + ox + sway * 0.45, cy + oy);
        ctx.rotate(ang);
        ctx.fillStyle = '#FACC15';
        ctx.strokeStyle = '#854D0E';
        ctx.lineWidth = 1;
        roundRect(ctx, -3.5, -8, 7, 13, 3.2);
        ctx.fill();
        ctx.stroke();
        // Kernel crosshatch
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(-1.5, -6, 1.5, 8);
        // Green husk wrapper at base
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(0, 7);
        ctx.lineTo(4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'cabai_rawit': {
      // Branching shrub with fiery red chilies
      ctx.strokeStyle = '#14532D';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx + sway * 0.3, cy - 5);
      ctx.stroke();
      drawLeaf(ctx, cx, cy + 3, 12, 4.8, -2.6, leaf, sprout);
      drawLeaf(ctx, cx, cy + 3, 12, 4.8, -0.5, leaf, sprout);
      drawLeaf(ctx, cx + sway * 0.4, cy - 4, 13, 5, -2.2, leaf, '#4ADE80');
      drawLeaf(ctx, cx + sway * 0.4, cy - 4, 13, 5, -0.9, leaf, '#4ADE80');
      drawLeaf(ctx, cx + sway * 0.5, cy - 10, 10, 4, -1.6, sprout);

      for (const [ox, oy, ang] of [
        [-7, -2, 0.35],
        [7, -1, -0.3],
        [-2, -9, 0.15],
        [3, 3, -0.2],
      ]) {
        ctx.save();
        ctx.translate(cx + ox + sway * 0.4, cy + oy);
        ctx.rotate(ang);
        ctx.fillStyle = ox === -2 ? '#F97316' : '#EF4444';
        ctx.strokeStyle = '#7F1D1D';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.quadraticCurveTo(2.5, 4, 0, 9);
        ctx.quadraticCurveTo(-3, 5, -2, 0);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#22C55E';
        ctx.fillRect(-1.5, -1.8, 3, 2);
        ctx.restore();
      }
      break;
    }

    case 'kedelai': {
      // Lush bush with fuzzy golden-tan soybean pods
      drawLeaf(ctx, cx - 2, cy + 3, 13, 5.2, -2.6, leaf, sprout);
      drawLeaf(ctx, cx + 2, cy + 3, 13, 5.2, -0.5, leaf, sprout);
      drawLeaf(ctx, cx + sway * 0.3, cy - 4, 12, 5, -2.1, sprout);
      drawLeaf(ctx, cx + sway * 0.3, cy - 4, 12, 5, -1.0, sprout);
      for (const [ox, oy, ang] of [
        [-7, 0, 0.4],
        [7, -1, -0.35],
        [0, 3, 0.2],
        [-3, -7, -0.25],
      ]) {
        ctx.save();
        ctx.translate(cx + ox + sway * 0.35, cy + oy);
        ctx.rotate(ang);
        ctx.fillStyle = '#EAB308';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1;
        roundRect(ctx, -2.4, -5.5, 4.8, 11, 2.4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(0, -2.5, 1.3, 0, Math.PI * 2);
        ctx.arc(0, 2.2, 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'bawang_merah': {
      // Plump glossy magenta shallot cluster at soil + upright hollow green stems
      for (const [ox, oy, rx, ry] of [
        [-6, 6, 5.2, 4.5],
        [6, 6.5, 5, 4.3],
        [0, 8, 5.8, 4.8],
      ]) {
        ctx.fillStyle = '#A21CAF';
        ctx.strokeStyle = '#4A044E';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx + ox, cy + oy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#F0ABFC';
        ctx.beginPath();
        ctx.ellipse(cx + ox - 1.5, cy + oy - 1.3, 1.6, 1.1, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = -2; i <= 2; i++) {
        ctx.strokeStyle = i % 2 === 0 ? '#16A34A' : '#15803D';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + i * 3, cy + 4);
        ctx.quadraticCurveTo(
          cx + i * 4 + sway * 0.5,
          cy - 5,
          cx + i * 5.2 + sway * 0.85,
          cy - 15 + Math.abs(i) * 1.5
        );
        ctx.stroke();
      }
      break;
    }

    case 'semangka': {
      // Curling vine + large striped watermelon
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy + 5);
      ctx.quadraticCurveTo(cx - 2, cy - 6, cx + 15 + sway * 0.2, cy + 5);
      ctx.stroke();
      drawLeaf(ctx, cx - 10, cy + 2, 11, 5.2, -2.3, leaf, sprout);
      drawLeaf(ctx, cx + 8, cy - 2, 11, 5.2, -0.6, leaf, sprout);

      // Melon body
      ctx.fillStyle = '#15803D';
      ctx.strokeStyle = '#052E16';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx + 1, cy + 5, 11.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Stripes
      ctx.strokeStyle = '#86EFAC';
      ctx.lineWidth = 2;
      for (const sx of [-5, 0, 5]) {
        ctx.beginPath();
        ctx.moveTo(cx + 1 + sx, cy - 3);
        ctx.quadraticCurveTo(cx + 1 + sx * 1.3, cy + 5, cx + 1 + sx, cy + 13);
        ctx.stroke();
      }
      // Gloss shine
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx - 3, cy + 1, 3.2, 1.8, -0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'singkong': {
      // Cassava tubers peeking at base + woody stem + iconic palmate radiating leaves
      for (const [ox, oy, ang] of [
        [-6, 8, -0.3],
        [5, 8.5, 0.35],
      ]) {
        ctx.save();
        ctx.translate(cx + ox, cy + oy);
        ctx.rotate(ang);
        ctx.fillStyle = '#92400E';
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 1;
        roundRect(ctx, -6, -2.5, 12, 5, 2.5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 8);
      ctx.lineTo(cx + sway * 0.35, cy - 11);
      ctx.stroke();
      for (let a = 0; a < 7; a++) {
        const ang = -Math.PI * 1.05 + (a / 6) * Math.PI * 1.1;
        drawLeaf(ctx, cx + sway * 0.35, cy - 11, 13, 3, ang, leaf, sprout);
      }
      break;
    }

    case 'kacang_tanah': {
      // Clover-like green bush + netted tan peanut pods clustered below
      for (let a = -2; a <= 2; a++) {
        drawLeaf(ctx, cx + a * 2 + sway * 0.3, cy - 2, 11, 4.6, -Math.PI / 2 + a * 0.45, leaf, sprout);
      }
      for (const [ox, oy, ang] of [
        [-6, 7, 0.2],
        [0, 8, -0.15],
        [6, 7, -0.3],
      ]) {
        ctx.save();
        ctx.translate(cx + ox, cy + oy);
        ctx.rotate(ang);
        ctx.fillStyle = '#D97706';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-2.3, 0, 3, 0, Math.PI * 2);
        ctx.arc(2.3, 0, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'tomat_lokal': {
      // Staked vine + plump red tomatoes
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 11);
      ctx.lineTo(cx, cy - 18);
      ctx.stroke();
      drawLeaf(ctx, cx, cy + 2, 12, 4.8, -2.5, leaf, sprout);
      drawLeaf(ctx, cx, cy + 2, 12, 4.8, -0.6, leaf, sprout);
      drawLeaf(ctx, cx + sway * 0.3, cy - 9, 12, 4.5, -2.2, leaf, '#4ADE80');
      drawLeaf(ctx, cx + sway * 0.3, cy - 9, 12, 4.5, -0.9, leaf, '#4ADE80');

      for (const [ox, oy] of [
        [-7, -4],
        [7, -2],
        [-4, 5],
        [5, 6],
      ]) {
        ctx.fillStyle = '#DC2626';
        ctx.strokeStyle = '#7F1D1D';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx + ox + sway * 0.35, cy + oy, 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.beginPath();
        ctx.arc(cx + ox - 1.5 + sway * 0.35, cy + oy - 1.5, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#15803D';
        ctx.fillRect(cx + ox - 1.5 + sway * 0.35, cy + oy - 5.5, 3, 2);
      }
      break;
    }

    case 'terong_ungu': {
      // Broad dark green leaves + glossy deep purple teardrop eggplants
      drawLeaf(ctx, cx - 2, cy - 2, 13, 5.5, -2.4, leaf, sprout);
      drawLeaf(ctx, cx + 2, cy - 2, 13, 5.5, -0.7, leaf, sprout);
      drawLeaf(ctx, cx + sway * 0.3, cy - 9, 11, 4.5, -1.6, sprout);

      for (const [ox, oy, ang] of [
        [-6, 1, 0.25],
        [6, 2, -0.22],
      ]) {
        ctx.save();
        ctx.translate(cx + ox + sway * 0.35, cy + oy);
        ctx.rotate(ang);
        ctx.fillStyle = '#7E22CE';
        ctx.strokeStyle = '#3B0764';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-2.5, -3);
        ctx.quadraticCurveTo(-5, 6, 0, 8.5);
        ctx.quadraticCurveTo(5, 6, 2.5, -3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#D8B4FE';
        ctx.beginPath();
        ctx.ellipse(-1.2, 2, 1, 2.6, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.moveTo(-3.5, -2);
        ctx.lineTo(0, -6);
        ctx.lineTo(3.5, -2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'padi_sawah': {
      // Irrigated paddy water + arching heavy golden grain panicles
      ctx.fillStyle = 'rgba(56, 189, 248, 0.32)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 9, 17, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let i = -3; i <= 3; i++) {
        const baseX = cx + i * 3.3;
        const tipX = cx + i * 5.2 + sway * 0.9;
        const tipY = cy - 13 + Math.abs(i) * 1.4;
        ctx.strokeStyle = '#16A34A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(baseX, cy + 9);
        ctx.quadraticCurveTo(baseX + sway * 0.4, cy - 4, tipX, tipY);
        ctx.stroke();

        // Drooping golden rice grain panicle
        ctx.strokeStyle = '#EAB308';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.quadraticCurveTo(tipX + (i < 0 ? -4 : 4), tipY + 2, tipX + (i < 0 ? -6 : 6), tipY + 7);
        ctx.stroke();
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(tipX + (i < 0 ? -4.5 : 4.5), tipY + 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'kangkung': {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 9, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      for (const [ox, ang, c] of [
        [-9, -2.5, leaf],
        [-5, -2.1, sprout],
        [-1, -1.65, leaf],
        [4, -1.25, sprout],
        [8, -0.7, leaf],
      ] as const) {
        drawLeaf(ctx, cx + ox * 0.45 + sway * 0.35, cy + 6, 16, 4.2, ang, c, '#A7F3D0');
      }
      // Morning-glory white-lavender blossom
      ctx.fillStyle = '#F5F3FF';
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx + 3 + sway * 0.4, cy - 7, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'talas': {
      // Dramatic giant heart-shaped taro leaves with pale veins + purple corm base
      ctx.fillStyle = '#7C3AED';
      ctx.strokeStyle = '#3B0764';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 9, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      for (const [ox, oy, r] of [
        [-8, -1, 9],
        [8, 0, 9],
        [0, -9, 11],
      ]) {
        ctx.strokeStyle = '#65A30D';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 7);
        ctx.lineTo(cx + ox + sway * 0.4, cy + oy);
        ctx.stroke();

        const lx = cx + ox + sway * 0.45;
        const ly = cy + oy - 2;
        ctx.fillStyle = leaf;
        ctx.strokeStyle = '#064E3B';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(lx, ly, r, r * 0.82, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Pale tropical leaf veins
        ctx.strokeStyle = '#A7F3D0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, ly - r * 0.55);
        ctx.lineTo(lx, ly + r * 0.55);
        ctx.moveTo(lx - r * 0.55, ly);
        ctx.lineTo(lx + r * 0.55, ly);
        ctx.stroke();
      }
      break;
    }

    default: {
      drawLeaf(ctx, cx, cy, 13, 5, -2.3, leaf, sprout);
      drawLeaf(ctx, cx, cy, 13, 5, -0.8, leaf, sprout);
      ctx.fillStyle = fruit;
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawSoilAndCrop(
  ctx: CanvasRenderingContext2D,
  plot: PlotState,
  px: number,
  py: number,
  elapsedTime: number
) {
  const s = TILE_SIZE;
  if (!plot.tilled) return;

  const isVolcanic = plot.scene === 'ORCHARD';
  // Richer rounded tilled earth bed with subtle 3D rim
  ctx.fillStyle = plot.watered
    ? isVolcanic
      ? '#241712'
      : '#422B1A'
    : isVolcanic
    ? '#4D3629'
    : '#765233';
  roundRect(ctx, px + 3, py + 3, s - 6, s - 6, 7);
  ctx.fill();

  ctx.strokeStyle = plot.watered
    ? 'rgba(15, 10, 6, 0.55)'
    : 'rgba(180, 130, 85, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Organic furrow ridges
  for (const fy of [12, 23, 34]) {
    ctx.fillStyle = plot.watered ? 'rgba(12, 8, 5, 0.42)' : 'rgba(65, 40, 20, 0.32)';
    roundRect(ctx, px + 7, py + fy, s - 14, 3.2, 1.6);
    ctx.fill();
    ctx.fillStyle = plot.watered ? 'rgba(125, 211, 252, 0.12)' : 'rgba(255, 245, 225, 0.09)';
    ctx.fillRect(px + 8, py + fy - 1, s - 16, 1);
  }

  // Organic compost specks when fertilized
  if (plot.fertilized) {
    for (const [fx, fy, c] of [
      [10, 9, '#FBBF24'],
      [34, 18, '#A3E635'],
      [15, 36, '#FBBF24'],
      [31, 33, '#84CC16'],
    ] as const) {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(px + fx, py + fy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Drought crack indicator
  if (!plot.watered && plot.dryDays >= 1 && plot.cropId && !plot.wilted) {
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px + 9, py + 11);
    ctx.lineTo(px + 16, py + 21);
    ctx.lineTo(px + 13, py + 34);
    ctx.stroke();
  }

  if (!plot.cropId) return;
  const crop = CROPS[plot.cropId];
  if (!crop) return;

  const cx = px + s / 2;
  const cy = py + s / 2 + 2;
  const sway = Math.sin(elapsedTime * 2.3 + plot.tx * 0.7 + plot.ty * 0.5) * 2.1;

  if (plot.wilted) {
    // Drooping withered dry plant
    ctx.strokeStyle = '#78716C';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy + 10);
    ctx.quadraticCurveTo(cx + 4, cy - 2, cx + 10, cy + 6);
    ctx.stroke();
    drawLeaf(ctx, cx + 3, cy + 1, 8, 3, 0.75, '#A8A29E', undefined, '#57534E');
    drawLeaf(ctx, cx - 1, cy + 3, 7, 2.8, 2.3, '#A8A29E', undefined, '#57534E');
    return;
  }

  const ratio = Math.min(1, plot.growthProgress / crop.growthDays);

  if (ratio < 0.22) {
    drawSeedStage(ctx, crop.id, cx, cy, plot.watered);
  } else if (ratio < 0.5) {
    drawSproutStage(ctx, crop.id, cx, cy, sway, crop.colors.sprout, crop.colors.leaf);
  } else if (ratio < 0.99) {
    drawGrowingCrop(ctx, crop.id, cx, cy, sway, crop.colors.sprout, crop.colors.leaf);
  } else {
    // Subtle warm harvest-ready halo
    ctx.fillStyle = 'rgba(254, 240, 138, 0.16)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    drawMatureCrop(
      ctx,
      crop.id,
      cx,
      cy,
      sway,
      crop.colors.sprout,
      crop.colors.leaf,
      crop.colors.fruit
    );

    // Floating crisp golden 4-point sparkle
    const bob = Math.sin(elapsedTime * 4.5 + plot.tx) * 2.2;
    const sy = py + 7 + bob;
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, sy - 5);
    ctx.lineTo(cx + 1.6, sy - 1.6);
    ctx.lineTo(cx + 5, sy);
    ctx.lineTo(cx + 1.6, sy + 1.6);
    ctx.lineTo(cx, sy + 5);
    ctx.lineTo(cx - 1.6, sy + 1.6);
    ctx.lineTo(cx - 5, sy);
    ctx.lineTo(cx - 1.6, sy - 1.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawCoconutPalm(
  ctx: CanvasRenderingContext2D,
  obj: WorldObject,
  cx: number,
  py: number,
  sway: number
) {
  const s = TILE_SIZE;
  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(cx + 2, py + s - 3, 21, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Curved ringed palm trunk
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, py + s - 5);
  ctx.quadraticCurveTo(cx - 5, py + 22, cx + 2 + sway * 0.4, py + 4);
  ctx.stroke();

  ctx.strokeStyle = '#A16207';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(cx, py + s - 6);
  ctx.quadraticCurveTo(cx - 5, py + 22, cx + 2 + sway * 0.4, py + 5);
  ctx.stroke();

  // Trunk rings
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 6; i++) {
    const ry = py + 11 + i * 5.2;
    const rx = cx - 2 + (i % 2 === 0 ? 0.5 : -0.5);
    ctx.beginPath();
    ctx.moveTo(rx - 3.5, ry);
    ctx.lineTo(rx + 3.5, ry - 1);
    ctx.stroke();
  }

  const topX = cx + 2 + sway * 0.55;
  const topY = py + 4;

  // 7 arching feathery palm fronds
  const frondAngles = [-2.8, -2.35, -1.85, -1.25, -0.7, -0.25, 0.25];
  for (const ang of frondAngles) {
    ctx.save();
    ctx.translate(topX, topY);
    ctx.rotate(ang + sway * 0.02);
    // Frond spine
    ctx.strokeStyle = '#15803D';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(14, -7, 27, 4);
    ctx.stroke();
    // Leaflets along frond
    ctx.fillStyle = '#22C55E';
    for (let f = 5; f <= 23; f += 3.5) {
      const t = f / 27;
      const fx = f;
      const fy = -7 * Math.sin(t * Math.PI) + t * 4;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx - 2, fy + 6.5);
      ctx.lineTo(fx + 2, fy + 1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Cluster of golden ivory coconuts under crown
  if (obj.harvestReady) {
    for (const [ox, oy] of [
      [-4, 4],
      [4, 4],
      [0, 8],
    ]) {
      ctx.fillStyle = '#FACC15';
      ctx.strokeStyle = '#854D0E';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(topX + ox, topY + oy, 4.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FEF9C3';
      ctx.beginPath();
      ctx.arc(topX + ox - 1.3, topY + oy - 1.3, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCalabashTree(
  ctx: CanvasRenderingContext2D,
  obj: WorldObject,
  cx: number,
  py: number,
  sway: number
) {
  const s = TILE_SIZE;

  // Wide lush ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(cx, py + s - 2, 27, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thick gnarled ancient trunk with mossy flared roots
  ctx.fillStyle = '#4B301D';
  ctx.strokeStyle = '#241309';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 14, py + s - 3);
  ctx.quadraticCurveTo(cx - 9, py + 31, cx - 8, py + 12);
  ctx.lineTo(cx + 8, py + 12);
  ctx.quadraticCurveTo(cx + 9, py + 31, cx + 14, py + s - 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mossy root accent & textured old bark
  ctx.fillStyle = '#3F6212';
  ctx.beginPath();
  ctx.ellipse(cx - 8, py + s - 6, 5.5, 2.8, -0.2, 0, Math.PI * 2);
  ctx.ellipse(cx + 9, py + s - 5, 4.5, 2.4, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Crooked horizontal old calabash boughs
  ctx.strokeStyle = '#3F2717';
  ctx.lineWidth = 4.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 3, py + 22);
  ctx.quadraticCurveTo(cx - 16, py + 18, cx - 24 + sway * 0.4, py + 13);
  ctx.moveTo(cx + 3, py + 21);
  ctx.quadraticCurveTo(cx + 17, py + 17, cx + 25 + sway * 0.4, py + 12);
  ctx.stroke();

  // Extra-wide, dense (rimbun) deep-jungle crown layers
  ctx.fillStyle = '#064E3B';
  ctx.strokeStyle = '#022C22';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx + sway * 0.65, py + 5, 25, 0, Math.PI * 2);
  ctx.arc(cx - 18 + sway * 0.55, py + 12, 16.5, 0, Math.PI * 2);
  ctx.arc(cx + 18 + sway * 0.55, py + 12, 16.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.arc(cx - 11 + sway * 0.7, py + 7, 15, 0, Math.PI * 2);
  ctx.arc(cx + 11 + sway * 0.7, py + 8, 14.5, 0, Math.PI * 2);
  ctx.arc(cx + sway * 0.75, py + 1, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4D7C0F';
  ctx.beginPath();
  ctx.arc(cx - 5 + sway * 0.8, py - 2, 10, 0, Math.PI * 2);
  ctx.arc(cx + 9 + sway * 0.8, py + 3, 8, 0, Math.PI * 2);
  ctx.fill();

  // Hanging old-vine tendrils
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - 19 + sway * 0.5, py + 19);
  ctx.lineTo(cx - 20 + sway * 0.9, py + 29);
  ctx.moveTo(cx + 19 + sway * 0.5, py + 18);
  ctx.lineTo(cx + 20 + sway * 0.9, py + 27);
  ctx.stroke();

  // Large round green Calabash gourds hanging on trunk & limbs
  if (obj.harvestReady) {
    const gourds: [number, number, number][] = [
      [-15, 19, 5.4],
      [15, 18, 5.6],
      [0, 23, 5.1],
    ];
    for (const [fx, fy, r] of gourds) {
      const gx = cx + fx + sway * 0.45;
      const gy = py + fy;
      ctx.strokeStyle = '#365314';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(gx, gy - r - 2);
      ctx.lineTo(gx, gy - r + 1);
      ctx.stroke();

      ctx.fillStyle = '#65A30D';
      ctx.strokeStyle = '#1A2E05';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(gx, gy, r, r * 1.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#D9F99D';
      ctx.beginPath();
      ctx.ellipse(gx - r * 0.32, gy - r * 0.3, r * 0.28, r * 0.18, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawLushTreeOrObject(
  ctx: CanvasRenderingContext2D,
  obj: WorldObject,
  elapsedTime: number
) {
  const s = TILE_SIZE;
  const px = obj.tx * s;
  const py = obj.ty * s;
  const cx = px + s / 2;
  const cy = py + s / 2;
  const sway = Math.sin(elapsedTime * 1.6 + obj.tx * 0.9 + obj.ty * 0.4) * 2.2;

  if (obj.kind === 'FRUIT_TREE' && obj.itemId === 'kelapa_gading') {
    drawCoconutPalm(ctx, obj, cx, py, sway);
    return;
  }

  if (obj.kind === 'FRUIT_TREE' && obj.itemId === 'buah_kalabas') {
    drawCalabashTree(ctx, obj, cx, py, sway);
    return;
  }

  if (obj.kind === 'TREE' || obj.kind === 'FRUIT_TREE') {
    const isDurian = obj.itemId === 'buah_durian';
    const isMango = obj.itemId === 'buah_mangga';
    const isForestLush = obj.kind === 'TREE';
    const canopyScale = isForestLush ? 1.18 + ((obj.tx * 7 + obj.ty * 3) % 3) * 0.06 : 1.0;

    // Rich ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, py + s - 4, 24 * canopyScale, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flared roots & textured bark trunk
    ctx.fillStyle = '#5C3A21';
    ctx.strokeStyle = '#2E180B';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(cx - 12.5, py + s - 4);
    ctx.quadraticCurveTo(cx - 7.5, py + 32, cx - 7, py + 14);
    ctx.lineTo(cx + 7, py + 14);
    ctx.quadraticCurveTo(cx + 7.5, py + 32, cx + 12.5, py + s - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bark highlight & moss base
    ctx.fillStyle = '#7C4D2B';
    ctx.fillRect(cx - 3.5, py + 17, 4, 21);
    ctx.fillStyle = '#4D7C0F';
    ctx.beginPath();
    ctx.ellipse(cx - 6.5, py + s - 6, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 7, py + s - 5.5, 4, 2.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Multi-layered lush canopy
    const baseLeaf = isDurian ? '#14532D' : isMango ? '#15803D' : '#14532D';
    const midLeaf = isDurian ? '#15803D' : isMango ? '#16A34A' : '#15803D';
    const topLeaf = isDurian ? '#4D7C0F' : isMango ? '#4ADE80' : '#22C55E';
    const sunLeaf = '#4ADE80';

    // Back dark foliage silhouette
    ctx.fillStyle = baseLeaf;
    ctx.strokeStyle = '#052E16';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx + sway * 0.7, py + 7, 23 * canopyScale, 0, Math.PI * 2);
    ctx.arc(cx - 16 * canopyScale + sway * 0.6, py + 15, 16 * canopyScale, 0, Math.PI * 2);
    ctx.arc(cx + 16 * canopyScale + sway * 0.6, py + 15, 16 * canopyScale, 0, Math.PI * 2);
    if (isForestLush) {
      ctx.arc(cx - 10 * canopyScale + sway * 0.65, py - 3, 14 * canopyScale, 0, Math.PI * 2);
      ctx.arc(cx + 10 * canopyScale + sway * 0.65, py - 2, 13.5 * canopyScale, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Mid foliage puffs
    ctx.fillStyle = midLeaf;
    ctx.beginPath();
    ctx.arc(cx - 10 * canopyScale + sway * 0.75, py + 9, 14.5 * canopyScale, 0, Math.PI * 2);
    ctx.arc(cx + 10 * canopyScale + sway * 0.75, py + 10, 14 * canopyScale, 0, Math.PI * 2);
    ctx.arc(cx + sway * 0.8, py + 2, 15.5 * canopyScale, 0, Math.PI * 2);
    if (isForestLush) {
      ctx.arc(cx - 15 * canopyScale + sway * 0.7, py + 16, 10 * canopyScale, 0, Math.PI * 2);
      ctx.arc(cx + 15 * canopyScale + sway * 0.7, py + 16, 10 * canopyScale, 0, Math.PI * 2);
    }
    ctx.fill();

    // Sunlit crown clusters
    ctx.fillStyle = topLeaf;
    ctx.beginPath();
    ctx.arc(cx - 4 + sway * 0.85, py - 1, 10 * canopyScale, 0, Math.PI * 2);
    ctx.arc(cx + 8 + sway * 0.85, py + 4, 7.8 * canopyScale, 0, Math.PI * 2);
    if (isForestLush) {
      ctx.arc(cx - 11 + sway * 0.8, py + 6, 7 * canopyScale, 0, Math.PI * 2);
    }
    ctx.fill();

    if (isForestLush) {
      ctx.fillStyle = sunLeaf;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(cx - 3 + sway * 0.9, py - 3, 5.2, 0, Math.PI * 2);
      ctx.arc(cx + 7 + sway * 0.9, py + 2, 4.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Subtle drooping tropical foliage fronds
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - 17 + sway * 0.6, py + 21);
      ctx.lineTo(cx - 18 + sway * 0.95, py + 29);
      ctx.moveTo(cx + 17 + sway * 0.6, py + 20);
      ctx.lineTo(cx + 18 + sway * 0.95, py + 28);
      ctx.stroke();
    }

    // Orchard fruits hanging cleanly from stems
    if (obj.kind === 'FRUIT_TREE' && obj.harvestReady) {
      if (isDurian) {
        for (const [fx, fy] of [
          [-10, 16],
          [9, 14],
          [0, 21],
        ]) {
          const x = cx + fx + sway * 0.75;
          const y = py + fy;
          ctx.fillStyle = '#CA8A04';
          ctx.strokeStyle = '#422006';
          ctx.lineWidth = 1;
          // Spiky oval silhouette
          ctx.beginPath();
          ctx.ellipse(x, y, 5.5, 6.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#FEF08A';
          ctx.fillRect(x - 1, y - 3, 2, 2);
          ctx.fillRect(x + 1.5, y + 1, 2, 2);
        }
      } else {
        // Teardrop mangoes with sunset blush
        for (const [fx, fy] of [
          [-10, 15],
          [9, 13],
          [-1, 20],
        ]) {
          const x = cx + fx + sway * 0.75;
          const y = py + fy;
          ctx.fillStyle = '#F59E0B';
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(x, y, 4.4, 5.4, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(x - 1.2, y - 1.5, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    return;
  }

  if (obj.kind === 'ROCK') {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy + 9);
    ctx.lineTo(cx - 11, cy - 5);
    ctx.lineTo(cx - 1, cy - 10);
    ctx.lineTo(cx + 12, cy - 4);
    ctx.lineTo(cx + 15, cy + 8);
    ctx.lineTo(cx + 4, cy + 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Faceted rock highlight & moss patch
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy - 3);
    ctx.lineTo(cx - 1, cy - 8);
    ctx.lineTo(cx + 8, cy - 3);
    ctx.lineTo(cx + 1, cy + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4D7C0F';
    ctx.beginPath();
    ctx.ellipse(cx + 7, cy + 6, 4.5, 2.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (obj.kind === 'TWIG') {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 14, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px + 10, py + 33);
    ctx.lineTo(px + 37, py + 17);
    ctx.moveTo(px + 22, py + 26);
    ctx.lineTo(px + 33, py + 35);
    ctx.stroke();
    ctx.strokeStyle = '#A16207';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px + 12, py + 31);
    ctx.lineTo(px + 35, py + 17);
    ctx.stroke();
    return;
  }

  if (obj.kind === 'WEED') {
    // Lush wild grass/fern tuft
    for (const [ox, len, ang, col] of [
      [-6, 15, -2.15, '#15803D'],
      [-2, 18, -1.75, '#16A34A'],
      [3, 17, -1.3, '#22C55E'],
      [7, 14, -0.95, '#15803D'],
    ] as const) {
      drawLeaf(ctx, cx + ox * 0.5 + sway * 0.25, py + 36, len, 3.8, ang, col);
    }
    return;
  }

  if (obj.kind === 'FORAGE') {
    const bob = Math.sin(elapsedTime * 3 + obj.tx) * 2;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.26)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 7, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (obj.itemId === 'buah_kalabas') {
      // Cluster of 3 fallen round green Calabash gourds resting on jungle leaves
      const fallen: [number, number, number][] = [
        [-7, 6, 5.5],
        [7, 5, 5.8],
        [0, -2, 6.2],
      ];
      for (const [ox, oy, r] of fallen) {
        const gx = cx + ox;
        const gy = cy + oy + bob * 0.5;
        ctx.fillStyle = '#65A30D';
        ctx.strokeStyle = '#1A2E05';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(gx, gy, r, r * 1.05, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#D9F99D';
        ctx.beginPath();
        ctx.ellipse(gx - r * 0.3, gy - r * 0.28, r * 0.28, r * 0.18, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gx, gy - r);
        ctx.lineTo(gx + 1, gy - r - 2.5);
        ctx.stroke();
      }
      return;
    } else if (obj.itemId === 'jamur_liar') {
      // Cluster of two warm amber forest mushrooms
      for (const [ox, oy, scale] of [
        [-5, 3, 0.78],
        [4, 0, 1],
      ]) {
        const mx = cx + ox;
        const my = cy + oy + bob;
        ctx.fillStyle = '#FEF3C7';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1;
        roundRect(ctx, mx - 3 * scale, my, 6 * scale, 9 * scale, 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(mx, my + 1, 9 * scale, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FEF3C7';
        ctx.beginPath();
        ctx.arc(mx - 3 * scale, my - 3 * scale, 1.6 * scale, 0, Math.PI * 2);
        ctx.arc(mx + 2.5 * scale, my - 2 * scale, 1.3 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (obj.itemId === 'daun_herbal') {
      // Glowing rosette of medicinal tropical leaves
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI + (i / 4) * Math.PI;
        drawLeaf(ctx, cx, cy + 6 + bob, 13, 4.8, ang, '#10B981', '#A7F3D0', '#064E3B');
      }
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(cx, cy + 4 + bob, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Akar Ginseng Jawa: golden gnarled root + crimson berries
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 1;
      roundRect(ctx, cx - 3.5, cy + 2 + bob, 7, 11, 3);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 2 + bob);
      ctx.lineTo(cx, cy - 8 + bob);
      ctx.stroke();
      drawLeaf(ctx, cx, cy - 4 + bob, 9, 3.2, -2.5, '#22C55E', '#86EFAC');
      drawLeaf(ctx, cx, cy - 4 + bob, 9, 3.2, -0.6, '#22C55E', '#86EFAC');
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(cx - 2, cy - 9 + bob, 2.2, 0, Math.PI * 2);
      ctx.arc(cx + 2, cy - 9 + bob, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
