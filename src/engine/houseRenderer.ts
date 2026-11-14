import { TILE_SIZE } from './maps';
import { RenderState } from './renderer';

function getWindowSkyPalette(timeMinutes: number) {
  if (timeMinutes < 450) {
    return { sky: '#FDBA74', glow: 'rgba(253, 186, 116, 0.14)', isNight: false };
  }
  if (timeMinutes < 1000) {
    return { sky: '#7DD3FC', glow: 'rgba(254, 249, 195, 0.14)', isNight: false };
  }
  if (timeMinutes < 1120) {
    return { sky: '#FB923C', glow: 'rgba(251, 146, 60, 0.14)', isNight: false };
  }
  return { sky: '#0F172A', glow: 'rgba(253, 224, 71, 0)', isNight: true };
}

/**
 * Renders the cohesive Indonesian Farmhouse Exterior on the FARM map
 * occupying collision footprint tx: 3..8, ty: 2..5 (door at tx=5, ty=5).
 */
export function drawFarmhouseExterior(ctx: CanvasRenderingContext2D, state: RenderState) {
  const s = TILE_SIZE;
  const x0 = 3 * s; // 144
  const y0 = 2 * s; // 96
  const w = 6 * s;  // 288
  const h = 4 * s;  // 192
  const isDark = state.timeMinutes >= 1020;

  ctx.save();

  // 1. Ground ambient shadow & porch welcome mat
  ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
  ctx.beginPath();
  ctx.roundRect(x0 - 8, y0 + h - 8, w + 16, 16, 6);
  ctx.fill();

  // Wooden front porch step & welcome mat in front of door (tx=5, ty=5)
  const doorX = 5 * s;
  const doorBaseY = 6 * s;
  ctx.fillStyle = '#7C4A26';
  ctx.strokeStyle = '#3B1E0D';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(doorX - 10, doorBaseY - 4, s + 20, 14, 3);
  ctx.fill();
  ctx.stroke();

  // Coir doormat on step
  ctx.fillStyle = '#B45309';
  ctx.fillRect(doorX + 6, doorBaseY - 1, s - 12, 8);
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 1;
  ctx.strokeRect(doorX + 8, doorBaseY + 1, s - 16, 4);

  // 2. Main House Walls (ty=4..5, y=192..288)
  const wallY = 4 * s;
  const wallH = 2 * s;

  // Plaster body
  ctx.fillStyle = '#F4EBD7';
  ctx.fillRect(x0 + 2, wallY, w - 4, wallH);

  // Subtle horizontal plaster shade band
  ctx.fillStyle = '#E6D8BC';
  ctx.fillRect(x0 + 2, wallY, w - 4, 14);

  // Stone masonry foundation at bottom
  ctx.fillStyle = '#78716C';
  ctx.fillRect(x0 + 2, wallY + wallH - 14, w - 4, 14);
  ctx.strokeStyle = '#44403C';
  ctx.lineWidth = 1.2;
  for (let bx = x0 + 6; bx < x0 + w - 10; bx += 20) {
    ctx.strokeRect(bx, wallY + wallH - 13, 18, 6);
    ctx.strokeRect(bx + 6, wallY + wallH - 7, 16, 6);
  }

  // Dark teak timber framing posts & beams (Soko Guru style)
  ctx.fillStyle = '#5C3A21';
  const beamXs = [x0, x0 + w - 10, doorX - 8, doorX + s + 2];
  for (const bx of beamXs) {
    ctx.fillRect(bx, wallY - 4, 9, wallH + 4);
  }
  ctx.fillRect(x0, wallY + 42, w, 7); // horizontal mid-beam

  // 3. Carved Front Door (tx=5, ty=5)
  ctx.fillStyle = '#432818';
  ctx.fillRect(doorX + 3, doorBaseY - 46, s - 6, 46);
  ctx.fillStyle = '#92400E';
  ctx.fillRect(doorX + 6, doorBaseY - 42, s - 12, 42);
  // Door inset panels & glass window
  ctx.fillStyle = isDark ? '#FDE047' : '#7DD3FC';
  ctx.fillRect(doorX + 12, doorBaseY - 37, s - 24, 13);
  ctx.strokeStyle = '#5C3A21';
  ctx.lineWidth = 2;
  ctx.strokeRect(doorX + 12, doorBaseY - 37, s - 24, 13);
  ctx.fillStyle = '#78350F';
  ctx.fillRect(doorX + 11, doorBaseY - 19, s - 22, 15);
  // Brass doorknob
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(doorX + s - 13, doorBaseY - 21, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Warm Hanging Porch Lantern beside door
  const lanternX = doorX + s + 11;
  const lanternY = doorBaseY - 34;
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(lanternX - 2, lanternY - 7, 4, 7);
  ctx.fillStyle = isDark ? '#FDE047' : '#FEF3C7';
  ctx.beginPath();
  ctx.roundRect(lanternX - 4, lanternY, 8, 10, 2);
  ctx.fill();
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  if (isDark) {
    const glow = ctx.createRadialGradient(lanternX, lanternY + 5, 4, lanternX, lanternY + 5, 46);
    glow.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
    glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lanternX, lanternY + 5, 46, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Louvered Nusantara Windows + Flower Boxes (tx=4 and tx=7)
  const drawExteriorWindow = (wx: number, wy: number) => {
    // Open green wooden shutters
    ctx.fillStyle = '#15803D';
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 1.4;
    ctx.fillRect(wx - 8, wy, 8, 28);
    ctx.strokeRect(wx - 8, wy, 8, 28);
    ctx.fillRect(wx + 30, wy, 8, 28);
    ctx.strokeRect(wx + 30, wy, 8, 28);

    // Glass pane
    ctx.fillStyle = isDark ? '#FDE047' : '#7DD3FC';
    ctx.fillRect(wx, wy, 30, 28);
    if (!isDark) {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.moveTo(wx + 4, wy + 24);
      ctx.lineTo(wx + 18, wy + 4);
      ctx.lineTo(wx + 24, wy + 4);
      ctx.lineTo(wx + 10, wy + 24);
      ctx.fill();
    }
    ctx.strokeStyle = '#5C3A21';
    ctx.lineWidth = 2.6;
    ctx.strokeRect(wx, wy, 30, 28);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(wx + 15, wy);
    ctx.lineTo(wx + 15, wy + 28);
    ctx.moveTo(wx, wy + 14);
    ctx.lineTo(wx + 30, wy + 14);
    ctx.stroke();

    // Wooden flower box below window
    ctx.fillStyle = '#78350F';
    ctx.fillRect(wx - 3, wy + 29, 36, 9);
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.arc(wx + 6, wy + 28, 5, 0, Math.PI * 2);
    ctx.arc(wx + 15, wy + 27, 6, 0, Math.PI * 2);
    ctx.arc(wx + 24, wy + 28, 5, 0, Math.PI * 2);
    ctx.fill();
    // Blossoms
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(wx + 6, wy + 26, 2.4, 0, Math.PI * 2);
    ctx.arc(wx + 23, wy + 26, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(wx + 15, wy + 25, 2.6, 0, Math.PI * 2);
    ctx.fill();
  };

  drawExteriorWindow(4 * s + 7, wallY + 26);
  drawExteriorWindow(7 * s + 9, wallY + 26);

  // Cute Garden Planter Bush beside porch left & right
  const drawYardPot = (px: number, py: number) => {
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.roundRect(px - 7, py - 8, 14, 10, 2);
    ctx.fill();
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(px, py - 12, 8, 0, Math.PI * 2);
    ctx.arc(px - 5, py - 10, 5, 0, Math.PI * 2);
    ctx.arc(px + 5, py - 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.arc(px - 2, py - 14, 2.3, 0, Math.PI * 2);
    ctx.arc(px + 4, py - 11, 2.2, 0, Math.PI * 2);
    ctx.fill();
  };
  drawYardPot(x0 + 18, doorBaseY - 2);
  drawYardPot(x0 + w - 18, doorBaseY - 2);

  // 5. Pitched Terracotta Genteng Roof (ty=2..3, with overhanging eaves)
  // Red-brick chimney on right slope
  const chimX = 7.55 * s;
  const chimY = y0 - 20;
  ctx.fillStyle = '#991B1B';
  ctx.strokeStyle = '#450A0A';
  ctx.lineWidth = 1.6;
  ctx.fillRect(chimX, chimY, 24, 40);
  ctx.strokeRect(chimX, chimY, 24, 40);
  ctx.fillStyle = '#7F1D1D';
  ctx.fillRect(chimX - 3, chimY - 4, 30, 7);
  ctx.strokeRect(chimX - 3, chimY - 4, 30, 7);

  // Rising chimney smoke puffs
  for (let i = 0; i < 3; i++) {
    const t = (state.elapsedTime * 0.45 + i * 0.33) % 1;
    ctx.save();
    ctx.globalAlpha = (1 - t) * 0.42;
    ctx.fillStyle = '#F1F5F9';
    ctx.beginPath();
    ctx.arc(chimX + 12 + Math.sin(t * 5 + i) * 6, chimY - 10 - t * 34, 5 + t * 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Main angled hipped roof polygon
  const roofLeft = x0 - 12;
  const roofRight = x0 + w + 12;
  const roofTop = y0 - 14;
  const roofBottom = wallY + 8;

  // Under-eave shadow on upper wall
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fillRect(x0, wallY, w, 10);

  // Roof main body gradient
  ctx.fillStyle = '#B44318';
  ctx.strokeStyle = '#5C1E0B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(roofLeft + 26, roofTop);
  ctx.lineTo(roofRight - 26, roofTop);
  ctx.lineTo(roofRight, roofBottom);
  ctx.lineTo(roofLeft, roofBottom);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Overlapping curved terracotta genteng shingle rows
  for (let ry = roofTop + 14; ry < roofBottom - 6; ry += 15) {
    const progress = (ry - roofTop) / (roofBottom - roofTop);
    const rowLeft = roofLeft + (1 - progress) * 24 + 4;
    const rowRight = roofRight - (1 - progress) * 24 - 4;
    ctx.strokeStyle = '#7C2D12';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let rx = rowLeft; rx < rowRight - 8; rx += 16) {
      ctx.moveTo(rx, ry);
      ctx.quadraticCurveTo(rx + 8, ry + 6, rx + 16, ry);
    }
    ctx.stroke();

    // Sunlit shingle rim
    ctx.strokeStyle = 'rgba(253, 186, 116, 0.30)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rowLeft, ry - 2);
    ctx.lineTo(rowRight, ry - 2);
    ctx.stroke();
  }

  // Top ridge cap (wuwungan)
  ctx.fillStyle = '#7C2D12';
  ctx.beginPath();
  ctx.roundRect(roofLeft + 22, roofTop - 4, roofRight - roofLeft - 44, 10, 4);
  ctx.fill();
  ctx.strokeStyle = '#431407';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Front Porch Gable Dormer over entrance (tx=4.7..6.3)
  const gableCx = doorX + s / 2;
  ctx.fillStyle = '#C2410C';
  ctx.strokeStyle = '#5C1E0B';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(gableCx, roofTop + 18);
  ctx.lineTo(gableCx + 48, wallY + 12);
  ctx.lineTo(gableCx - 48, wallY + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gable cream wood triangle inlay & carved fascia trim
  ctx.fillStyle = '#EFE3C8';
  ctx.beginPath();
  ctx.moveTo(gableCx, roofTop + 30);
  ctx.lineTo(gableCx + 34, wallY + 10);
  ctx.lineTo(gableCx - 34, wallY + 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5C3A21';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(gableCx - 48, wallY + 12);
  ctx.lineTo(gableCx, roofTop + 18);
  ctx.lineTo(gableCx + 48, wallY + 12);
  ctx.stroke();

  // Mahkota / Javanese roof crown finial on gable tip
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(gableCx, roofTop + 16, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Renders the Research Laboratory Building Exterior on the LAB map
 * occupying collision footprint tx: 11..16, ty: 3..6 — shaped like our Farmhouse
 * with weathered lab slate/copper accents and a sealed un-enterable entrance.
 */
export function drawLabBuildingExterior(ctx: CanvasRenderingContext2D, state: RenderState) {
  const s = TILE_SIZE;
  const x0 = 11 * s;
  const y0 = 3 * s;
  const w = 6 * s; // 288 (same 6x4 proportions as player house)
  const h = 4 * s; // 192
  const isDark = state.timeMinutes >= 1020;

  ctx.save();

  // 1. Ground shadow & stone lab porch step
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.roundRect(x0 - 8, y0 + h - 8, w + 16, 16, 6);
  ctx.fill();

  const doorX = 13.5 * s;
  const doorBaseY = 7 * s;
  ctx.fillStyle = '#57534E';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(doorX - s / 2 - 10, doorBaseY - 4, s + 20, 14, 3);
  ctx.fill();
  ctx.stroke();

  // Hazard steel threshold plate
  ctx.fillStyle = '#475569';
  ctx.fillRect(doorX - 18, doorBaseY - 1, 36, 7);

  // 2. Main Lab Walls (ty=5..6) — same timber-framed cream-stone plaster silhouette as house
  const wallY = 5 * s;
  const wallH = 2 * s;

  ctx.fillStyle = '#E7E2D6';
  ctx.fillRect(x0 + 2, wallY, w - 4, wallH);

  // Subtle horizontal plaster shade & moss streaks
  ctx.fillStyle = '#D5CFC0';
  ctx.fillRect(x0 + 2, wallY, w - 4, 15);
  ctx.fillStyle = 'rgba(63, 98, 18, 0.35)';
  ctx.fillRect(x0 + 14, wallY + wallH - 22, 22, 9);
  ctx.fillRect(x0 + w - 44, wallY + 12, 18, 14);

  // Heavy masonry stone foundation
  ctx.fillStyle = '#64748B';
  ctx.fillRect(x0 + 2, wallY + wallH - 14, w - 4, 14);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2;
  for (let bx = x0 + 6; bx < x0 + w - 10; bx += 20) {
    ctx.strokeRect(bx, wallY + wallH - 13, 18, 6);
    ctx.strokeRect(bx + 6, wallY + wallH - 7, 16, 6);
  }

  // Dark bronze/walnut structural beams
  ctx.fillStyle = '#4A2C18';
  const beamXs = [x0, x0 + w - 10, doorX - s / 2 - 6, doorX + s / 2 - 3];
  for (const bx of beamXs) {
    ctx.fillRect(bx, wallY - 4, 9, wallH + 4);
  }
  ctx.fillRect(x0, wallY + 42, w, 7);

  // 3. Sealed Double Lab Door (cannot be entered) + Brass Padlock
  const dLeft = doorX - s / 2 + 2;
  const dW = s - 4;
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(dLeft, doorBaseY - 46, dW, 46);
  ctx.fillStyle = '#475569';
  ctx.fillRect(dLeft + 3, doorBaseY - 43, dW / 2 - 4, 43);
  ctx.fillRect(dLeft + dW / 2 + 1, doorBaseY - 43, dW / 2 - 4, 43);
  // Reinforced rivets & sealed amber observation slits
  ctx.fillStyle = isDark ? '#2DD4BF' : '#0D9488';
  ctx.fillRect(dLeft + 7, doorBaseY - 37, dW / 2 - 12, 12);
  ctx.fillRect(dLeft + dW / 2 + 5, doorBaseY - 37, dW / 2 - 12, 12);
  // Brass padlock bar across double door
  ctx.fillStyle = '#B45309';
  ctx.fillRect(doorX - 11, doorBaseY - 21, 22, 4);
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.roundRect(doorX - 4.5, doorBaseY - 19, 9, 9, 2);
  ctx.fill();
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Flanking warm amber porch lanterns
  for (const lx of [dLeft - 7, dLeft + dW + 7]) {
    const ly = doorBaseY - 32;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(lx - 2, ly - 6, 4, 6);
    ctx.fillStyle = isDark ? '#2DD4BF' : '#FDE68A';
    ctx.beginPath();
    ctx.roundRect(lx - 4, ly, 8, 9, 2);
    ctx.fill();
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // 4. Lab Shuttered Windows with Botanical Specimen Glow
  const drawLabWindow = (wx: number, wy: number) => {
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.3;
    ctx.fillRect(wx - 7, wy, 7, 28);
    ctx.strokeRect(wx - 7, wy, 7, 28);
    ctx.fillRect(wx + 30, wy, 7, 28);
    ctx.strokeRect(wx + 30, wy, 7, 28);

    ctx.fillStyle = isDark ? '#14B8A6' : '#67E8F9';
    ctx.fillRect(wx, wy, 30, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath();
    ctx.moveTo(wx + 4, wy + 24);
    ctx.lineTo(wx + 17, wy + 4);
    ctx.lineTo(wx + 23, wy + 4);
    ctx.lineTo(wx + 10, wy + 24);
    ctx.fill();
    ctx.strokeStyle = '#4A2C18';
    ctx.lineWidth = 2.4;
    ctx.strokeRect(wx, wy, 30, 28);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wx + 15, wy);
    ctx.lineTo(wx + 15, wy + 28);
    ctx.moveTo(wx, wy + 14);
    ctx.lineTo(wx + 30, wy + 14);
    ctx.stroke();

    // Planter box with Kalabas research vines
    ctx.fillStyle = '#57534E';
    ctx.fillRect(wx - 3, wy + 29, 36, 8);
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(wx + 6, wy + 28, 4.5, 0, Math.PI * 2);
    ctx.arc(wx + 15, wy + 27, 5.5, 0, Math.PI * 2);
    ctx.arc(wx + 24, wy + 28, 4.5, 0, Math.PI * 2);
    ctx.fill();
  };

  drawLabWindow(11 * s + 16, wallY + 26);
  drawLabWindow(15 * s + 8, wallY + 26);

  // 5. Pitched Roof (same silhouette as Farmhouse roof, in weathered Slate-Bronze Lab Shingles)
  // Rooftop Research Antenna Dish & Exhaust Pipe on right slope
  const pipeX = 15.6 * s;
  const pipeY = y0 - 22;
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.5;
  ctx.fillRect(pipeX, pipeY, 18, 40);
  ctx.strokeRect(pipeX, pipeY, 18, 40);
  ctx.fillStyle = '#B45309';
  ctx.fillRect(pipeX - 3, pipeY - 4, 24, 7);
  ctx.strokeRect(pipeX - 3, pipeY - 4, 24, 7);
  // Small glowing dish mast
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0 + 48, y0 - 4);
  ctx.lineTo(x0 + 48, y0 - 24);
  ctx.stroke();
  ctx.fillStyle = '#2DD4BF';
  ctx.beginPath();
  ctx.arc(x0 + 48, y0 - 25, 3, 0, Math.PI * 2);
  ctx.fill();

  const roofLeft = x0 - 12;
  const roofRight = x0 + w + 12;
  const roofTop = y0 - 14;
  const roofBottom = wallY + 8;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fillRect(x0, wallY, w, 10);

  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(roofLeft + 26, roofTop);
  ctx.lineTo(roofRight - 26, roofTop);
  ctx.lineTo(roofRight, roofBottom);
  ctx.lineTo(roofLeft, roofBottom);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Slate tile courses + mossy roof accents
  for (let ry = roofTop + 14; ry < roofBottom - 6; ry += 15) {
    const progress = (ry - roofTop) / (roofBottom - roofTop);
    const rowLeft = roofLeft + (1 - progress) * 24 + 4;
    const rowRight = roofRight - (1 - progress) * 24 - 4;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let rx = rowLeft; rx < rowRight - 8; rx += 16) {
      ctx.moveTo(rx, ry);
      ctx.quadraticCurveTo(rx + 8, ry + 6, rx + 16, ry);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rowLeft, ry - 2);
    ctx.lineTo(rowRight, ry - 2);
    ctx.stroke();
  }

  // Moss patches on old lab roof
  ctx.fillStyle = 'rgba(77, 124, 15, 0.55)';
  ctx.beginPath();
  ctx.ellipse(x0 + 54, roofTop + 34, 14, 6, 0.2, 0, Math.PI * 2);
  ctx.ellipse(x0 + w - 50, roofTop + 50, 12, 5, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Ridge cap (wuwungan)
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.roundRect(roofLeft + 22, roofTop - 4, roofRight - roofLeft - 44, 10, 4);
  ctx.fill();
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Front Lab Porch Gable + Plaque "LAB PENELITIAN"
  const gableCx = doorX;
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(gableCx, roofTop + 18);
  ctx.lineTo(gableCx + 50, wallY + 12);
  ctx.lineTo(gableCx - 50, wallY + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#E7E2D6';
  ctx.beginPath();
  ctx.moveTo(gableCx, roofTop + 30);
  ctx.lineTo(gableCx + 36, wallY + 10);
  ctx.lineTo(gableCx - 36, wallY + 10);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#4A2C18';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(gableCx - 50, wallY + 12);
  ctx.lineTo(gableCx, roofTop + 18);
  ctx.lineTo(gableCx + 50, wallY + 12);
  ctx.stroke();

  // Copper lab crest orb
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(gableCx, roofTop + 16, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Brass & slate plaque above door
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(gableCx - 52, wallY + 1, 104, 15, 3);
  ctx.fill();
  ctx.stroke();
  ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FDE68A';
  ctx.fillText('LAB PENELITIAN', gableCx, wallY + 11.5);

  ctx.restore();
}

/**
 * Renders individual hardwood parquet floors & structural walls for the HOUSE map
 * before unified multi-tile furniture and room decor are layered on top.
 */
export function drawHouseTileBase(
  ctx: CanvasRenderingContext2D,
  tile: string,
  tx: number,
  ty: number,
  px: number,
  py: number
) {
  const s = TILE_SIZE;
  if (tile === 'WALL') {
    // Rich dark timber outer wall & room border
    ctx.fillStyle = '#2B1D14';
    ctx.fillRect(px, py, s, s);
    ctx.fillStyle = '#3E2A1E';
    ctx.fillRect(px + 2, py + 2, s - 4, s - 6);
    return;
  }

  if (tile === 'BATH_FLOOR') {
    // Cool glazed ceramic bathroom mosaic tiles
    const sub = s / 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const alt = (tx * 3 + c + ty * 3 + r) % 2 === 0;
        ctx.fillStyle = alt ? '#D2ECEA' : '#C1E2E0';
        ctx.fillRect(px + c * sub, py + r * sub, sub, sub);
        ctx.strokeStyle = 'rgba(15, 118, 110, 0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + c * sub + 0.5, py + r * sub + 0.5, sub - 1, sub - 1);
      }
    }
    if (ty === 2) {
      ctx.fillStyle = 'rgba(15, 45, 42, 0.18)';
      ctx.fillRect(px, py, s, 8);
    }
    return;
  }

  // Determine wood palette by room zone
  let base = '#C99E6E';
  let plankAlt = '#BE9160';
  const seam = 'rgba(72, 42, 18, 0.22)';
  if (tx >= 17) {
    // Kamar Tidur & Kerja: warm honey teak
    base = '#BD8E5E';
    plankAlt = '#B28252';
  }

  ctx.fillStyle = base;
  ctx.fillRect(px, py, s, s);

  // Staggered parquet wood planks (3 strips per tile)
  const plankH = s / 3;
  for (let i = 0; i < 3; i++) {
    if ((tx + ty + i) % 2 === 0) {
      ctx.fillStyle = plankAlt;
      ctx.fillRect(px, py + i * plankH, s, plankH);
    }
    ctx.fillStyle = seam;
    ctx.fillRect(px, py + i * plankH, s, 1);

    const jointX = px + (((tx * 17 + ty * 31 + i * 23) % 32) + 8);
    ctx.fillRect(jointX, py + i * plankH, 1, plankH);
  }

  if (ty === 2) {
    ctx.fillStyle = 'rgba(28, 18, 10, 0.22)';
    ctx.fillRect(px, py, s, 8);
  }
}

function drawWovenRug(
  ctx: CanvasRenderingContext2D,
  xTile: number,
  yTile: number,
  wTiles: number,
  hTiles: number,
  mainHex: string,
  borderHex: string,
  accentHex: string
) {
  const s = TILE_SIZE;
  const rx = xTile * s + 6;
  const ry = yTile * s + 6;
  const rw = wTiles * s - 12;
  const rh = hTiles * s - 12;

  ctx.save();
  // Soft shadow under rug
  ctx.fillStyle = 'rgba(20, 12, 6, 0.18)';
  ctx.beginPath();
  ctx.roundRect(rx + 2, ry + 3, rw, rh, 6);
  ctx.fill();

  // Tassel fringes on left & right edges
  ctx.strokeStyle = '#F5E6C8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let fy = ry + 8; fy < ry + rh - 6; fy += 8) {
    ctx.moveTo(rx - 5, fy);
    ctx.lineTo(rx + 1, fy);
    ctx.moveTo(rx + rw - 1, fy);
    ctx.lineTo(rx + rw + 5, fy);
  }
  ctx.stroke();

  // Main fabric body
  ctx.fillStyle = mainHex;
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, 5);
  ctx.fill();

  // Double Nusantara woven border
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 5;
  ctx.strokeRect(rx + 7, ry + 7, rw - 14, rh - 14);

  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 1.6;
  ctx.strokeRect(rx + 12, ry + 12, rw - 24, rh - 24);

  // Center Batik diamond medallion
  const cx = rx + rw / 2;
  const cy = ry + rh / 2;
  ctx.fillStyle = borderHex;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 22);
  ctx.lineTo(cx + 30, cy);
  ctx.lineTo(cx, cy + 22);
  ctx.lineTo(cx - 30, cy);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = accentHex;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 9);
  ctx.lineTo(cx + 12, cy);
  ctx.lineTo(cx, cy + 9);
  ctx.lineTo(cx - 12, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawInteriorWallDecor(ctx: CanvasRenderingContext2D, state: RenderState) {
  const s = TILE_SIZE;
  const sky = getWindowSkyPalette(state.timeMinutes);

  // Draw interior walls across the 3 rooms
  // Room 1: Kamar Mandi (tile wainscoting)
  const bathX = 1 * s;
  const bathY = 1 * s;
  const bathW = 7 * s;
  ctx.fillStyle = '#E6F4F3';
  ctx.fillRect(bathX, bathY, bathW, s - 16);
  ctx.fillStyle = '#0F766E';
  ctx.fillRect(bathX, bathY + s - 16, bathW, 16);
  ctx.fillStyle = '#14B8A6';
  ctx.fillRect(bathX, bathY + s - 17, bathW, 3);
  ctx.fillStyle = '#134E4A';
  ctx.fillRect(bathX, bathY + s - 3, bathW, 3);

  // Room 2 & Room 3: Warm plaster + teak wainscoting
  const woodRoomSpans: [number, number][] = [
    [9, 15],  // Ruang Tengah & Dapur
    [17, 22], // Kamar Tidur & PC
  ];

  for (const [x1, x2] of woodRoomSpans) {
    const wx = x1 * s;
    const wy = 1 * s;
    const ww = (x2 - x1 + 1) * s;

    ctx.fillStyle = '#EFE4CE';
    ctx.fillRect(wx, wy, ww, s - 16);

    ctx.fillStyle = 'rgba(180, 140, 95, 0.08)';
    for (let sx = wx + 8; sx < wx + ww; sx += 16) {
      ctx.fillRect(sx, wy, 4, s - 16);
    }

    ctx.fillStyle = '#6E472B';
    ctx.fillRect(wx, wy + s - 16, ww, 16);
    ctx.fillStyle = '#8B5E3C';
    ctx.fillRect(wx, wy + s - 17, ww, 3);
    ctx.fillStyle = '#4A2E1B';
    ctx.fillRect(wx, wy + s - 3, ww, 3);
  }

  // Room header wooden plaques
  const drawRoomPlaque = (centerTileX: number, title: string) => {
    const cx = centerTileX * s;
    ctx.save();
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    const textW = ctx.measureText(title).width;
    const boxW = textW + 20;
    ctx.fillStyle = '#4A2C18';
    ctx.strokeStyle = '#925B33';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - boxW / 2, 18, boxW, 20, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FEF3C7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, cx, 28);
    ctx.restore();
  };

  drawRoomPlaque(4.5, 'Kamar Mandi · Kolam');
  drawRoomPlaque(12.5, 'Ruang Tengah & Dapur');
  drawRoomPlaque(20.0, 'Kamar Tidur & PC');

  // Sunlit Glass Windows with curtains on ty=1
  const drawInteriorWindow = (tileX: number, curtainColor: string, frosted = false) => {
    const wx = tileX * s + 6;
    const wy = 1 * s + 4;
    const ww = s - 12;
    const wh = 30;

    ctx.fillStyle = frosted ? '#BAE6FD' : sky.sky;
    ctx.fillRect(wx, wy, ww, wh);
    if (!frosted && sky.isNight) {
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(wx + 6, wy + 7, 2, 2);
      ctx.fillRect(wx + 22, wy + 12, 2, 2);
      ctx.fillRect(wx + 14, wy + 5, 1.5, 1.5);
    }

    ctx.strokeStyle = '#5C3A21';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy);
    ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2);
    ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.stroke();

    ctx.fillStyle = curtainColor;
    ctx.beginPath();
    ctx.roundRect(wx - 4, wy - 2, 9, wh + 4, 2);
    ctx.roundRect(wx + ww - 5, wy - 2, 9, wh + 4, 2);
    ctx.fill();

    if (!sky.isNight) {
      ctx.save();
      ctx.fillStyle = sky.glow;
      ctx.beginPath();
      ctx.moveTo(wx, 2 * s);
      ctx.lineTo(wx + ww, 2 * s);
      ctx.lineTo(wx + ww + 12, 3.6 * s);
      ctx.lineTo(wx - 12, 3.6 * s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  drawInteriorWindow(2, '#0F766E', true);
  drawInteriorWindow(14, '#B91C1C');
  drawInteriorWindow(21, '#1D4ED8');

  // Kamar Mandi Wall Towel Rack at tx=3.6
  ctx.fillStyle = '#78350F';
  ctx.fillRect(3.4 * s, 1 * s + 12, 34, 4);
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(3.4 * s + 3, 1 * s + 14, 12, 16);
  ctx.fillStyle = '#2DD4BF';
  ctx.fillRect(3.4 * s + 18, 1 * s + 14, 12, 16);

  // Kamar Tidur & Kerja Decor: Framed Nusantara Mountain Painting at tx=19 & Certificate at tx=17
  const artX = 19 * s + 6;
  const artY = 1 * s + 6;
  ctx.fillStyle = '#78350F';
  ctx.fillRect(artX, artY, 36, 24);
  ctx.fillStyle = '#7DD3FC';
  ctx.fillRect(artX + 3, artY + 3, 30, 18);
  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.moveTo(artX + 3, artY + 21);
  ctx.lineTo(artX + 14, artY + 9);
  ctx.lineTo(artX + 24, artY + 17);
  ctx.lineTo(artX + 30, artY + 11);
  ctx.lineTo(artX + 33, artY + 21);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(artX + 27, artY + 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Ruang Tengah Decor: Kitchen Spice Shelf at tx=9..10 & Wall Clock at tx=11.45
  ctx.fillStyle = '#5C3A21';
  ctx.fillRect(9 * s + 8, 1 * s + 22, 80, 5);
  const jarColors = ['#DC2626', '#FACC15', '#16A34A', '#EA580C'];
  jarColors.forEach((c, idx) => {
    ctx.fillStyle = c;
    ctx.fillRect(9 * s + 14 + idx * 14, 1 * s + 12, 8, 10);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(9 * s + 14 + idx * 14, 1 * s + 10, 8, 3);
  });

  const clockX = 11.45 * s;
  const clockY = 1 * s + 17;
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(clockX, clockY, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFBEB';
  ctx.beginPath();
  ctx.arc(clockX, clockY, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(clockX, clockY);
  ctx.lineTo(clockX, clockY - 5);
  ctx.moveTo(clockX, clockY);
  ctx.lineTo(clockX + 4, clockY + 2);
  ctx.stroke();

  // Kamar Tidur & PC Decor: Framed Certificate & Calendar at tx=17
  ctx.fillStyle = '#FEF3C7';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2;
  ctx.fillRect(17 * s + 6, 1 * s + 7, 20, 22);
  ctx.strokeRect(17 * s + 6, 1 * s + 7, 20, 22);
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(17 * s + 8, 1 * s + 9, 16, 4);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(17 * s + 32, 1 * s + 8, 16, 20);
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(17 * s + 32, 1 * s + 8, 16, 6);

  // Room Divider Archway Trim (x=8 & x=16, y=5..7)
  for (const dx of [8 * s, 16 * s]) {
    ctx.fillStyle = '#7C4A26';
    ctx.fillRect(dx + 2, 5 * s, 4, 3 * s);
    ctx.fillRect(dx + s - 6, 5 * s, 4, 3 * s);
    ctx.fillStyle = 'rgba(92, 58, 33, 0.35)';
    ctx.fillRect(dx + 6, 5 * s, s - 12, 3 * s);
  }
}

/**
 * Draws floor-level interior elements, back walls, unified rugs, bathroom pool & vanity,
 * kitchen, TV, bed, bookcase, and exit doormat before the player.
 */
export function drawHouseInteriorBase(ctx: CanvasRenderingContext2D, state: RenderState) {
  const s = TILE_SIZE;
  const isDark = state.timeMinutes >= 1050;

  // 1. Back Wall Plaster, Windows, Art, Wall Plaques, Room Archways
  drawInteriorWallDecor(ctx, state);

  // 2. Unified Woven Rugs & Bamboo Bath Mat
  // Bamboo slatted bath mat in front of Kolam Rendam (tx: 2..4, ty: 6)
  const bmX = 2 * s + 6;
  const bmY = 6 * s + 6;
  const bmW = 3 * s - 12;
  const bmH = s - 14;
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(bmX, bmY, bmW, bmH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#D97706';
  for (let slat = bmX + 6; slat < bmX + bmW - 6; slat += 9) {
    ctx.fillRect(slat, bmY + 4, 5, bmH - 8);
  }

  drawWovenRug(ctx, 10, 6, 5, 3, '#991B1B', '#DC2626', '#FDE047'); // Ruang Tengah
  drawWovenRug(ctx, 18, 5, 3, 2, '#1E3A8A', '#2563EB', '#FDE047'); // Kamar Tidur & PC (between bed & PC)

  // 2b. KAMAR MANDI: Kolam Rendam Air Hangat (tx: 2..4, ty: 4..5)
  const pxPool = 2 * s + 3;
  const pyPool = 4 * s + 3;
  const pwPool = 3 * s - 6;
  const phPool = 2 * s - 6;

  // Stone/slate pool outer rim
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(pxPool, pyPool, pwPool, phPool, 8);
  ctx.fill();
  ctx.stroke();

  // Inner carved rim bevel
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.roundRect(pxPool + 5, pyPool + 5, pwPool - 10, phPool - 10, 6);
  ctx.fill();

  // Warm crystal-clear turquoise bath water
  ctx.fillStyle = '#0891B2';
  ctx.beginPath();
  ctx.roundRect(pxPool + 9, pyPool + 9, pwPool - 18, phPool - 18, 5);
  ctx.fill();

  ctx.fillStyle = '#22D3EE';
  ctx.beginPath();
  ctx.roundRect(pxPool + 12, pyPool + 12, pwPool - 24, phPool - 26, 4);
  ctx.fill();

  // Gentle water shimmer ripples
  const waveShift = Math.sin(state.elapsedTime * 2.2) * 4;
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pxPool + 24 + waveShift, pyPool + 28);
  ctx.lineTo(pxPool + 56 + waveShift, pyPool + 28);
  ctx.moveTo(pxPool + 68 - waveShift, pyPool + 48);
  ctx.lineTo(pxPool + 104 - waveShift, pyPool + 48);
  ctx.stroke();

  // Bamboo Pancuran water spout on top-left corner
  ctx.fillStyle = '#65A30D';
  ctx.strokeStyle = '#365314';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(pxPool + 10, pyPool - 3, 18, 9, 2);
  ctx.fill();
  ctx.stroke();
  // Falling water trickle into pool
  ctx.fillStyle = 'rgba(186, 230, 253, 0.78)';
  ctx.fillRect(pxPool + 25, pyPool + 5, 3, 13);

  // Wooden bath bucket (Ember & Gayung) + folded white towel on bottom-right rim
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.arc(pxPool + pwPool - 16, pyPool + phPool - 13, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(pxPool + pwPool - 16, pyPool + phPool - 13, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Gentle rising warm steam wisps over the pool
  for (let i = 0; i < 4; i++) {
    const st = (state.elapsedTime * 0.55 + i * 0.25) % 1;
    ctx.save();
    ctx.globalAlpha = (1 - st) * 0.35;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(
      pxPool + 26 + i * 26 + Math.sin(st * 5 + i) * 4,
      pyPool + 38 - st * 26,
      4 + st * 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // 2c. KAMAR MANDI: Ceramic Sink Vanity & Mirror (tx: 5..6, ty: 2)
  const vx = 5 * s + 4;
  const vy = 2 * s + 2;
  const vw = 2 * s - 8;
  const vh = s - 8;
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(vx, vy, vw, vh, 4);
  ctx.fill();
  ctx.stroke();
  // Oval ceramic sink & chrome tap
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(vx + 26, vy + 18, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.ellipse(vx + 26, vy + 18, 9, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Soap dispenser & cup on right
  ctx.fillStyle = '#14B8A6';
  ctx.fillRect(vx + 54, vy + 10, 8, 12);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(vx + 67, vy + 12, 8, 10);

  // 3. Exit Double Door & Coir Doormat (tx=11..12, ty=11)
  const doorX = 11 * s;
  const doorY = 11 * s;
  ctx.fillStyle = '#5C3A21';
  ctx.fillRect(doorX + 4, doorY - 4, s * 2 - 8, 22);
  ctx.fillStyle = '#92400E';
  ctx.fillRect(doorX + 8, doorY - 2, s - 10, 18);
  ctx.fillRect(doorX + s + 2, doorY - 2, s - 10, 18);
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(doorX + s - 5, doorY + 7, 2.5, 0, Math.PI * 2);
  ctx.arc(doorX + s + 5, doorY + 7, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Welcome doormat in front of exit
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(doorX + 10, doorY - 24, s * 2 - 20, 18, 3);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(doorX + 14, doorY - 20, s * 2 - 28, 10);

  // 4. Unified Double Teak Bed + Nightstand & Glowing Lamp (tx: 18..19, ty: 3..4)
  const bx = 18 * s + 4;
  const by = 3 * s + 4;
  const bw = 66;
  const bh = s * 2 - 10;

  ctx.fillStyle = '#5C3A21';
  ctx.strokeStyle = '#2B170A';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#7C4A26';
  ctx.fillRect(bx + 3, by + 2, bw - 6, 12);

  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.roundRect(bx + 5, by + 13, bw - 10, bh - 20, 3);
  ctx.fill();
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.roundRect(bx + 8, by + 16, 24, 15, 4);
  ctx.roundRect(bx + 34, by + 16, 24, 15, 4);
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#B91C1C';
  ctx.beginPath();
  ctx.roundRect(bx + 5, by + 35, bw - 10, bh - 42, 3);
  ctx.fill();
  ctx.fillStyle = '#FDE68A';
  ctx.fillRect(bx + 5, by + 35, bw - 10, 5);
  ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
  ctx.beginPath();
  ctx.arc(bx + bw / 2, by + 58, 9, 0, Math.PI * 2);
  ctx.fill();

  const nx = bx + bw + 4;
  const ny = by + 6;
  ctx.fillStyle = '#6E4224';
  ctx.strokeStyle = '#2B170A';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(nx, ny, 20, 26, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#D97706';
  ctx.fillRect(nx + 8, ny + 12, 4, 6);
  ctx.fillStyle = isDark ? '#FDE047' : '#FEF3C7';
  ctx.beginPath();
  ctx.moveTo(nx + 4, ny + 12);
  ctx.lineTo(nx + 16, ny + 12);
  ctx.lineTo(nx + 13, ny + 4);
  ctx.lineTo(nx + 7, ny + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (isDark) {
    const lampGlow = ctx.createRadialGradient(nx + 10, ny + 8, 3, nx + 10, ny + 8, 52);
    lampGlow.addColorStop(0, 'rgba(253, 224, 71, 0.36)');
    lampGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(nx + 10, ny + 8, 52, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Dapur Nusantara (tx: 9..10, ty: 2)
  const kx = 9 * s + 2;
  const ky = 2 * s + 2;
  const kw = s * 2 - 4;
  const kh = s - 6;

  // Counter body & granite top
  ctx.fillStyle = '#57534E';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(kx, ky, kw, kh, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#D6D3D1';
  ctx.fillRect(kx + 3, ky + 3, kw - 6, kh - 12);

  // Left: Stainless Sink & Faucet + Dish Stack
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(kx + 8, ky + 8, 28, 20);
  ctx.fillStyle = '#475569';
  ctx.fillRect(kx + 11, ky + 11, 22, 14);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(kx + 22, ky + 10, 4, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Cutting board & knife
  ctx.fillStyle = '#B45309';
  ctx.fillRect(kx + 41, ky + 10, 12, 16);

  // Right: 2-Burner Stove + Simmering Pot with steam!
  ctx.fillStyle = '#1C1917';
  ctx.fillRect(kx + 57, ky + 6, 32, 24);
  ctx.strokeStyle = '#78716C';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(kx + 66, ky + 18, 6, 0, Math.PI * 2);
  ctx.arc(kx + 81, ky + 18, 6, 0, Math.PI * 2);
  ctx.stroke();

  // Copper kettle / rice pot on stove
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.arc(kx + 81, ky + 18, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FDBA74';
  ctx.beginPath();
  ctx.arc(kx + 81, ky + 17, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Gentle steam wisps above pot
  for (let i = 0; i < 2; i++) {
    const st = (state.elapsedTime * 0.9 + i * 0.5) % 1;
    ctx.save();
    ctx.globalAlpha = (1 - st) * 0.45;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(kx + 81 + Math.sin(st * 6) * 3, ky + 10 - st * 14, 2.5 + st * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 6. Smart TV & Media Console + Potted Monstera (tx: 12, ty: 2)
  const txX = 12 * s;
  const txY = 2 * s;
  // Wooden TV cabinet
  ctx.fillStyle = '#6E4224';
  ctx.strokeStyle = '#2B170A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(txX + 2, txY + 14, s - 4, s - 18, 3);
  ctx.fill();
  ctx.stroke();

  // Cabinet drawer handles
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(txX + 10, txY + 34, 8, 2);
  ctx.fillRect(txX + s - 18, txY + 34, 8, 2);

  // Flatscreen Smart TV with live animated BMKG weather screen
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(txX + 5, txY + 2, s - 10, 26, 3);
  ctx.fill();
  ctx.stroke();

  const tvPulse = 0.85 + Math.sin(state.elapsedTime * 3) * 0.15;
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(txX + 8, txY + 5, s - 16, 20);
  // Weather map green landmass & glowing sun icon on TV
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.ellipse(txX + 20, txY + 16, 8, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(253, 224, 71, ${tvPulse})`;
  ctx.beginPath();
  ctx.arc(txX + 33, txY + 10, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Decorative indoor potted plant right of TV (inside tx=13 wall edge without blocking y=3!)
  // Placed cleanly on corner of TV stand edge:
  ctx.fillStyle = '#B45309';
  ctx.fillRect(txX + s - 10, txY + 20, 8, 8);
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.arc(txX + s - 6, txY + 16, 6, 0, Math.PI * 2);
  ctx.fill();

  // 7. Bookcase & Farm Archive (tx: 21..22, ty: 2)
  const shX = 21 * s + 4;
  const shY = 2 * s + 2;
  const shW = s * 2 - 8;
  const shH = s - 4;
  ctx.fillStyle = '#5C3A21';
  ctx.strokeStyle = '#2B170A';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(shX, shY, shW, shH, 3);
  ctx.fill();
  ctx.stroke();

  // Two recessed shelves filled with colorful books & binders
  for (let row = 0; row < 2; row++) {
    const sy = shY + 5 + row * 19;
    ctx.fillStyle = '#3B2212';
    ctx.fillRect(shX + 4, sy, shW - 8, 15);
    const bookColors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#A855F7', '#06B6D4', '#EC4899'];
    for (let b = 0; b < 9; b++) {
      ctx.fillStyle = bookColors[(b + row * 3) % bookColors.length];
      const bhBook = 10 + ((b + row) % 3) * 1.5;
      ctx.fillRect(shX + 7 + b * 8, sy + (15 - bhBook), 6, bhBook);
    }
  }
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(shX + shW - 14, shY + 13, 4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws Sofa (ty=4) and PC Workstation (ty=3) which are depth-sorted against playerY
 * so walking behind them vs in front of them feels genuinely 2.5D!
 */
export function drawHouseDepthFurniture(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  layer: 'BEHIND_PLAYER' | 'IN_FRONT_OF_PLAYER'
) {
  const s = TILE_SIZE;
  const playerTy = state.playerY;

  const drawSofa = () => {
    // Sofa spans tx: 11..13, ty: 4
    const sx = 11 * s + 3;
    const sy = 4 * s + 6;
    const sw = s * 3 - 6;
    const sh = s - 10;

    ctx.save();
    // Floor shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.roundRect(sx + 2, sy + sh - 4, sw, 8, 4);
    ctx.fill();

    // Teak base & armrests
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = '#3B1E0D';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 6);
    ctx.fill();
    ctx.stroke();

    // Backrest cushion
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.roundRect(sx + 8, sy + 2, sw - 16, 14, 4);
    ctx.fill();
    ctx.stroke();

    // 3 segmented mustard seat cushions
    const seatW = (sw - 22) / 3;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.roundRect(sx + 10 + i * (seatW + 1), sy + 14, seatW - 1, sh - 18, 4);
      ctx.fill();
      ctx.stroke();
    }

    // Left & right rounded armrests
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.roundRect(sx + 1, sy + 4, 10, sh - 6, 4);
    ctx.roundRect(sx + sw - 11, sy + 4, 10, sh - 6, 4);
    ctx.fill();
    ctx.stroke();

    // Accent throw pillows
    ctx.fillStyle = '#0D9488';
    ctx.beginPath();
    ctx.roundRect(sx + 13, sy + 9, 14, 11, 3);
    ctx.fill();
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.roundRect(sx + sw - 27, sy + 9, 14, 11, 3);
    ctx.fill();
    ctx.restore();
  };

  const drawPCWorkstation = () => {
    // PC Desk spans tx: 18..21, ty: 8..9 (2x bigger workstation directly below the bed!)
    const dx = 18 * s + 4;
    const dy = 8 * s + 12;
    const dw = s * 4 - 8; // 184px wide (2x old 92px)
    const dh = s * 1.5 - 6; // 66px deep (nearly 2x old 40px)

    ctx.save();
    // Ambient drop shadow under entire executive PC desk
    ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
    ctx.beginPath();
    ctx.roundRect(dx + 3, dy + 8, dw, dh + 4, 8);
    ctx.fill();

    // Large Ergonomic Swivel Chair on front/south side of desk
    const chairX = dx + dw * 0.44;
    const chairY = dy + dh - 2;
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(chairX - 24, chairY - 6, 48, 22, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(chairX - 20, chairY + 2, 40, 13, 5);
    ctx.fill();
    ctx.stroke();
    // Chair headrest / cushion stripe
    ctx.fillStyle = '#0EA5E9';
    ctx.fillRect(chairX - 10, chairY + 5, 20, 4);

    // Wide Executive Walnut Desk Top
    ctx.fillStyle = '#5C3A21';
    ctx.strokeStyle = '#2B170A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(dx, dy, dw, dh, 7);
    ctx.fill();
    ctx.stroke();

    // Desk wood highlight & front bevel
    ctx.fillStyle = '#7C4D2B';
    ctx.beginPath();
    ctx.roundRect(dx + 4, dy + 4, dw - 8, dh - 14, 4);
    ctx.fill();
    ctx.fillStyle = '#3E2514';
    ctx.fillRect(dx + 3, dy + dh - 9, dw - 6, 7);

    // Large Desk Mat + Backlit Mechanical Keyboard + Mouse
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(dx + 36, dy + 32, 84, 24, 4);
    ctx.fill();

    // Keyboard body & glowing keys
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.roundRect(dx + 42, dy + 36, 52, 15, 2);
    ctx.fill();
    ctx.fillStyle = '#334155';
    for (let r = 0; r < 3; r++) {
      ctx.fillRect(dx + 45, dy + 38 + r * 4, 46, 2.5);
    }
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(dx + 44, dy + 49, 48, 2);

    // Ergonomic mouse on right of pad
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.ellipse(dx + 107, dy + 44, 5.5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(dx + 106, dy + 39, 2, 4);

    // Studio Speakers left & right of monitor
    for (const spX of [dx + 24, dx + 124]) {
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(spX, dy + 8, 13, 20, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(spX + 6.5, dy + 19, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2x Oversized Ultra-Wide TaniNet Monitor (centered above desk)
    const monW = 88;
    const monH = 44;
    const monX = dx + 36;
    const monY = dy - 16;

    // Brushed aluminum monitor neck & wide base
    ctx.fillStyle = '#334155';
    ctx.fillRect(monX + monW / 2 - 8, monY + monH - 2, 16, 12);
    ctx.beginPath();
    ctx.roundRect(monX + monW / 2 - 20, monY + monH + 7, 40, 6, 2);
    ctx.fill();

    // Monitor bezel
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(monX, monY, monW, monH, 5);
    ctx.fill();
    ctx.stroke();

    // Glowing TaniNet OS screen
    ctx.fillStyle = '#0369A1';
    ctx.fillRect(monX + 4, monY + 4, monW - 8, monH - 9);
    // Top TaniNet taskbar
    ctx.fillStyle = '#0C4A6E';
    ctx.fillRect(monX + 4, monY + 4, monW - 8, 7);
    // Market dashboard cards & live price pulse
    ctx.fillStyle = '#34D399';
    ctx.fillRect(monX + 8, monY + 14, 30, 10);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(monX + 42, monY + 14, 34, 10);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(monX + 8, monY + 27, 48, 8);
    ctx.fillStyle = '#F97316';
    ctx.fillRect(monX + 60, monY + 27, 16, 8);

    // Subtle soft screen reflection glow
    const scrGlow = 0.14 + Math.sin(state.elapsedTime * 2.5) * 0.04;
    ctx.fillStyle = `rgba(56, 189, 248, ${scrGlow})`;
    ctx.beginPath();
    ctx.ellipse(monX + monW / 2, dy + 34, 48, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2x Scale RGB Workstation PC Tower on far right of desk
    const twX = dx + dw - 38;
    const twY = dy - 4;
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(twX, twY, 30, 52, 4);
    ctx.fill();
    ctx.stroke();

    // Tower glass panel & dual glowing cyan/emerald fans
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(twX + 4, twY + 5, 22, 38);
    ctx.fillStyle = '#22D3EE';
    ctx.fillRect(twX + 5, twY + 6, 3, 36);
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(twX + 17, twY + 15, 5.5, 0, Math.PI * 2);
    ctx.arc(twX + 17, twY + 31, 5.5, 0, Math.PI * 2);
    ctx.stroke();

    // Desk Lamp (top-left corner) + Steaming Kopi Mug
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(dx + 15, dy + 44, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.arc(dx + 15, dy + 44, 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(dx + 13, dy + 15, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
    ctx.beginPath();
    ctx.arc(dx + 13, dy + 15, 17, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // PC Workstation spans ty=8..9 (foot line y = 9.65)
  const pcFront = playerTy < 9.65;
  if ((layer === 'IN_FRONT_OF_PLAYER') === pcFront) {
    drawPCWorkstation();
  }

  // Sofa is at ty=4 (foot line y = 4.9)
  const sofaFront = playerTy < 4.9;
  if ((layer === 'IN_FRONT_OF_PLAYER') === sofaFront) {
    drawSofa();
  }

  // When player is soaking in the pool, draw front stone rim & water shimmer over lower torso!
  if (layer === 'IN_FRONT_OF_PLAYER' && state.isBathing) {
    const pxPool = 2 * s + 3;
    const pyPool = 4 * s + 3;
    const pwPool = 3 * s - 6;
    const phPool = 2 * s - 6;
    ctx.save();
    ctx.fillStyle = 'rgba(34, 211, 238, 0.55)';
    ctx.fillRect(pxPool + 12, pyPool + phPool - 32, pwPool - 24, 18);
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(pxPool, pyPool + phPool - 14, pwPool, 14, [0, 0, 8, 8]);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
