import { TILE_SIZE } from './maps';

export interface RobotDrawParams {
  x: number; // world tile X
  y: number; // world tile Y
  hp: number;
  maxHp: number;
  owned: boolean;
  defeatedToday: boolean;
  inCombat: boolean;
  hitFlash: number; // 0..1
  attackAnim: number; // 0..1
  elapsedTime: number;
}

export interface CombatProjectile {
  x: number; // world tile X
  y: number; // world tile Y
  vx: number; // tiles/sec
  vy: number; // tiles/sec
  life: number;
  fromPlayer: boolean;
  damage: number;
  color: string;
}

/**
 * Renders a heavy articulated Mecha Robot in light brown (coklat muda)
 * and dark brown (coklat tua) tactical armor plating.
 */
export function drawBrownRobot(ctx: CanvasRenderingContext2D, params: RobotDrawParams) {
  const px = params.x * TILE_SIZE;
  const py = params.y * TILE_SIZE;

  const isDowned = params.defeatedToday && !params.owned;
  const bob = isDowned ? 4 : Math.sin(params.elapsedTime * (params.inCombat ? 9.5 : 4.2)) * 2.2;
  const armSwing = isDowned
    ? 0.42
    : params.attackAnim > 0
    ? -Math.sin(params.attackAnim * Math.PI) * 1.2
    : Math.sin(params.elapsedTime * (params.inCombat ? 8 : 3.4)) * 0.22;

  // Two-tone Mecha Brown Palette: Coklat Tua (dark frame) + Coklat Muda (armor plates)
  const darkBrown = params.hitFlash > 0.1 ? '#B45309' : '#4A2511';      // Coklat tua
  const deepBrown = params.hitFlash > 0.1 ? '#D97706' : '#2F1507';      // Coklat tua gelap (frame/joints)
  const lightBrown = params.hitFlash > 0.1 ? '#FEF3C7' : '#C68E5B';     // Coklat muda (main mecha armor)
  const paleBrown = params.hitFlash > 0.1 ? '#FFFFFF' : '#DEB082';      // Coklat muda highlight
  const brass = '#D97706';
  const outline = '#1C0D05';

  const visorColor = params.owned
    ? '#10B981'
    : isDowned
    ? '#38BDF8'
    : params.inCombat
    ? '#EF4444'
    : '#F59E0B';

  ctx.save();
  ctx.translate(px, py);

  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath();
  ctx.ellipse(0, 15, 24, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, bob);
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';

  // Dorsal Mecha Thruster Wing Pack (peeking behind shoulders)
  ctx.fillStyle = darkBrown;
  ctx.beginPath();
  ctx.moveTo(-21, -29);
  ctx.lineTo(-10, -25);
  ctx.lineTo(-10, -8);
  ctx.lineTo(-23, -13);
  ctx.closePath();
  ctx.moveTo(21, -29);
  ctx.lineTo(10, -25);
  ctx.lineTo(10, -8);
  ctx.lineTo(23, -13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Articulated Mecha Legs (Dark Brown inner frame + Light Brown shin/thigh armor)
  const stepL = isDowned ? 0 : Math.sin(params.elapsedTime * (params.inCombat ? 9.5 : 4)) * 3.2;
  const stepR = -stepL;
  for (const [side, step] of [
    [-1, stepL],
    [1, stepR],
  ] as const) {
    const lx = side * 9;
    const ly = -2 + step * 0.45;
    // Inner piston thigh (coklat tua)
    ctx.fillStyle = deepBrown;
    ctx.beginPath();
    ctx.roundRect(lx - 4.5, ly - 2, 9, 8, 2);
    ctx.fill();
    ctx.stroke();

    // Angular shin armor (coklat muda)
    ctx.fillStyle = lightBrown;
    ctx.beginPath();
    ctx.roundRect(lx - 5.5, ly + 4, 11, 9, 2.5);
    ctx.fill();
    ctx.stroke();

    // Heavy mecha foot boot (coklat tua)
    ctx.fillStyle = darkBrown;
    ctx.beginPath();
    ctx.roundRect(lx - 6.5, ly + 11, 13, 5, 2);
    ctx.fill();
    ctx.stroke();

    // Knee servo bolt
    ctx.fillStyle = brass;
    ctx.beginPath();
    ctx.arc(lx, ly + 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Articulated Mecha Arms with Shoulder Pauldrons
  for (const side of [-1, 1] as const) {
    ctx.save();
    ctx.translate(side * 19, -21);
    ctx.rotate(side === -1 ? armSwing * 0.65 : -armSwing);

    // Upper arm piston (coklat tua)
    ctx.fillStyle = deepBrown;
    ctx.beginPath();
    ctx.roundRect(-3.5, 2, 7, 9, 2);
    ctx.fill();
    ctx.stroke();

    // Heavy forearm gauntlet (coklat muda + trim coklat tua)
    ctx.fillStyle = lightBrown;
    ctx.beginPath();
    ctx.roundRect(-4.8, 10, 9.6, 11, 2.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = darkBrown;
    ctx.fillRect(-3.8, 13, 7.6, 3);

    // Armored fist claw
    ctx.fillStyle = deepBrown;
    ctx.beginPath();
    ctx.roundRect(-4.5, 20, 9, 6, 2);
    ctx.fill();
    ctx.stroke();

    // Angular Mecha Shoulder Pauldron (coklat muda & coklat tua layer)
    ctx.fillStyle = darkBrown;
    ctx.beginPath();
    ctx.roundRect(-7, -7, 14, 10, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = paleBrown;
    ctx.beginPath();
    ctx.roundRect(-5.5, -5.5, 11, 5.5, 2);
    ctx.fill();

    ctx.restore();
  }

  // Mecha Waist Core (coklat tua)
  ctx.fillStyle = deepBrown;
  ctx.beginPath();
  ctx.roundRect(-11, -7, 22, 7, 2.5);
  ctx.fill();
  ctx.stroke();

  // Main Angular Mecha Torso (coklat tua chassis + coklat muda V-chest armor)
  ctx.fillStyle = darkBrown;
  ctx.beginPath();
  ctx.moveTo(-16, -26);
  ctx.lineTo(16, -26);
  ctx.lineTo(13, -6);
  ctx.lineTo(-13, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Light brown V-chest breastplate
  ctx.fillStyle = lightBrown;
  ctx.beginPath();
  ctx.moveTo(-13.5, -24);
  ctx.lineTo(13.5, -24);
  ctx.lineTo(10, -10);
  ctx.lineTo(0, -7);
  ctx.lineTo(-10, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Top chest highlight ridge
  ctx.fillStyle = paleBrown;
  ctx.fillRect(-10, -23, 20, 4);

  // Chest Hex Core Reactor
  ctx.fillStyle = deepBrown;
  ctx.beginPath();
  ctx.arc(0, -15.5, 5.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = visorColor;
  ctx.beginPath();
  ctx.arc(0, -15.5, 3.4, 0, Math.PI * 2);
  ctx.fill();

  // Panel vents on sides of torso
  ctx.fillStyle = deepBrown;
  ctx.fillRect(-10, -20, 3.5, 2);
  ctx.fillRect(6.5, -20, 3.5, 2);

  // Angular Mecha Helmet & V-Fin Crest
  ctx.save();
  ctx.translate(0, isDowned ? -29 : -36);
  if (isDowned) ctx.rotate(0.16);

  // Helmet base (coklat tua)
  ctx.fillStyle = darkBrown;
  ctx.beginPath();
  ctx.moveTo(-12.5, -9);
  ctx.lineTo(-9, -15);
  ctx.lineTo(9, -15);
  ctx.lineTo(12.5, -9);
  ctx.lineTo(11, 7);
  ctx.lineTo(-11, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Light brown cheek/crown armor plates
  ctx.fillStyle = lightBrown;
  ctx.beginPath();
  ctx.roundRect(-10.5, -12, 21, 7, 2.5);
  ctx.fill();
  ctx.stroke();

  // Mecha chin guard (coklat muda)
  ctx.fillStyle = lightBrown;
  ctx.beginPath();
  ctx.roundRect(-6.5, 2, 13, 5, 2);
  ctx.fill();
  ctx.stroke();

  // Ear sensor pods (coklat tua + brass ring)
  ctx.fillStyle = darkBrown;
  ctx.beginPath();
  ctx.roundRect(-15, -7, 3.5, 9, 1.5);
  ctx.roundRect(11.5, -7, 3.5, 9, 1.5);
  ctx.fill();
  ctx.stroke();

  // Recessed tactical visor slit
  ctx.fillStyle = '#18100C';
  ctx.beginPath();
  ctx.roundRect(-9.5, -5.5, 19, 6.5, 2);
  ctx.fill();

  // Glowing robotic eyes/visor beam
  ctx.fillStyle = visorColor;
  if (isDowned) {
    ctx.fillRect(-6.5, -3, 5, 1.8);
    ctx.fillRect(1.5, -3, 5, 1.8);
  } else {
    ctx.beginPath();
    ctx.moveTo(-8, -3.5);
    ctx.lineTo(-1.5, -2.5);
    ctx.lineTo(-1.5, -0.8);
    ctx.lineTo(-7.5, -1.2);
    ctx.closePath();
    ctx.moveTo(8, -3.5);
    ctx.lineTo(1.5, -2.5);
    ctx.lineTo(1.5, -0.8);
    ctx.lineTo(7.5, -1.2);
    ctx.closePath();
    ctx.fill();
  }

  // Iconic Mecha V-Fin Antenna Crest on forehead (coklat muda & brass)
  ctx.fillStyle = paleBrown;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(-14, -21);
  ctx.lineTo(-10, -14);
  ctx.lineTo(0, -9);
  ctx.lineTo(10, -14);
  ctx.lineTo(14, -21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = brass;
  ctx.beginPath();
  ctx.roundRect(-2.5, -13, 5, 4.5, 1.5);
  ctx.fill();

  ctx.restore();

  // Nameplate & HP Bar above Robot
  ctx.save();
  const barY = -67;
  ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';

  const label = params.owned
    ? 'Robot Mecha (Milikmu)'
    : isDowned
    ? 'Robot Mecha (Reset 03:00)'
    : `Robot Mecha Coklat · ${Math.max(0, Math.ceil(params.hp))}/${params.maxHp}`;

  const textW = ctx.measureText(label).width;
  const pillW = Math.max(108, textW + 14);
  ctx.fillStyle = 'rgba(12, 10, 9, 0.8)';
  ctx.beginPath();
  ctx.roundRect(-pillW / 2, barY - 14, pillW, 17, 5);
  ctx.fill();

  ctx.fillStyle = params.owned ? '#6EE7B7' : isDowned ? '#7DD3FC' : '#FDE68A';
  ctx.fillText(label, 0, barY - 2);

  if (!params.owned && !isDowned) {
    const bw = 78;
    const bh = 6;
    ctx.fillStyle = 'rgba(28, 25, 23, 0.9)';
    ctx.fillRect(-bw / 2, barY + 5, bw, bh);
    const ratio = Math.max(0, Math.min(1, params.hp / params.maxHp));
    ctx.fillStyle = ratio > 0.45 ? '#D97706' : '#EF4444';
    ctx.fillRect(-bw / 2 + 1, barY + 6, (bw - 2) * ratio, bh - 2);
  }
  ctx.restore();

  ctx.restore();
}

export function drawCombatProjectile(ctx: CanvasRenderingContext2D, proj: CombatProjectile) {
  const px = proj.x * TILE_SIZE;
  const py = proj.y * TILE_SIZE - 16;
  ctx.save();
  ctx.translate(px, py);
  const angle = Math.atan2(proj.vy, proj.vx);
  ctx.rotate(angle);

  ctx.fillStyle = proj.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 7.5, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(1.5, 0, 3.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
