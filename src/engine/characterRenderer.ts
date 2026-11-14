import { FacingDir } from './renderer';

export type PlayerActionKind =
  | 'NONE'
  | 'HOE'
  | 'AXE'
  | 'SCYTHE'
  | 'SWORD'
  | 'RIFLE'
  | 'WATER'
  | 'PLANT'
  | 'HARVEST'
  | 'CONSUME';

export interface FarmerDrawParams {
  x: number;
  y: number;
  facingDir: FacingDir;
  walkCycle: number;
  isMoving: boolean;
  actionKind: PlayerActionKind;
  actionProgress: number; // 0 when idle/walking, 0..1 during active action
  selectedItemId: string;
  hasSteelHoe?: boolean;
  hasBigWateringCan?: boolean;
  isBathing?: boolean;
  isWading?: boolean;
  elapsedTime: number;
}

const OUTLINE = '#161A22';
const SKIN = '#E6A778';
const SKIN_LIGHT = '#F1BA91';
const SKIN_SHADE = '#C9875B';
const HAIR = '#1F242D';
const HAIR_SHADE = '#14171D';
const HAIR_LIGHT = '#3E4656';
const SHIRT = '#F5F7FA';
const SHIRT_SHADE = '#D6DFEA';
const SHIRT_DEEP = '#BAC7D8';
const PANTS = '#232830';
const PANTS_LIGHT = '#313742';
const PANTS_SHADE = '#14181E';
const SANDAL_BLUE = '#2B538F';
const SANDAL_LIGHT = '#4170B5';
const SANDAL_DARK = '#192F54';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

function easeInOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

function easeOutBack(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

interface ActionPose {
  squatY: number;
  torsoLean: number;
  headTilt: number;
  stanceSpread: number;
  armForward: number;
  wristAngle: number;
  frontArcArm: number;
  sweepSide: number;
  slashAlpha: number;
  pourAlpha: number;
  seedAlpha: number;
}

function computeActionPose(kind: PlayerActionKind, p: number): ActionPose {
  const neutral: ActionPose = {
    squatY: 0,
    torsoLean: 0,
    headTilt: 0,
    stanceSpread: 0,
    armForward: 0,
    wristAngle: 0,
    frontArcArm: 0,
    sweepSide: 0,
    slashAlpha: 0,
    pourAlpha: 0,
    seedAlpha: 0,
  };

  if (kind === 'NONE' || p <= 0) return neutral;

  if (kind === 'HOE' || kind === 'AXE') {
    const heavy = kind === 'AXE' ? 1.16 : 1.0;
    if (p < 0.30) {
      const t = easeOutCubic(p / 0.30);
      return {
        ...neutral,
        squatY: lerp(0, -0.8, t),
        torsoLean: lerp(0, -0.20 * heavy, t),
        headTilt: lerp(0, -0.08, t),
        stanceSpread: lerp(0, 2.2, t),
        armForward: lerp(-0.15, -2.55 * (kind === 'AXE' ? 1.04 : 1.0), t),
        wristAngle: lerp(0, -0.45, t),
        frontArcArm: lerp(0, -1.0, t),
      };
    } else if (p < 0.58) {
      const t = easeInOutCubic((p - 0.30) / 0.28);
      return {
        ...neutral,
        squatY: lerp(-0.8, 4.2 * heavy, t),
        torsoLean: lerp(-0.20 * heavy, 0.30 * heavy, t),
        headTilt: lerp(-0.08, 0.14, t),
        stanceSpread: 2.2 + t * 0.6,
        armForward: lerp(-2.55, kind === 'AXE' ? -0.78 : -0.52, t),
        wristAngle: lerp(-0.45, 0.38, t),
        frontArcArm: lerp(-1.0, 0.95, t),
        slashAlpha: Math.sin(t * Math.PI) * 0.85,
      };
    } else {
      const t = easeOutCubic((p - 0.58) / 0.42);
      const strikeArm = kind === 'AXE' ? -0.78 : -0.52;
      return {
        ...neutral,
        squatY: lerp(4.2 * heavy, 0, t),
        torsoLean: lerp(0.30 * heavy, 0, t),
        headTilt: lerp(0.14, 0, t),
        stanceSpread: lerp(2.8, 0, t),
        armForward: lerp(strikeArm, 0, t),
        wristAngle: lerp(0.38, 0, t),
        frontArcArm: lerp(0.95, 0, t),
      };
    }
  }

  if (kind === 'SCYTHE' || kind === 'SWORD') {
    const isSword = kind === 'SWORD';
    if (p < 0.25) {
      const t = easeOutCubic(p / 0.25);
      return {
        ...neutral,
        squatY: lerp(0, isSword ? 2.2 : 3.0, t),
        torsoLean: lerp(0, isSword ? -0.10 : 0.14, t),
        stanceSpread: lerp(0, 2.8, t),
        armForward: lerp(0, isSword ? -2.2 : 0.55, t),
        sweepSide: lerp(0, -1.0, t),
      };
    } else if (p < 0.62) {
      const t = easeInOutCubic((p - 0.25) / 0.37);
      return {
        ...neutral,
        squatY: lerp(isSword ? 2.2 : 3.0, isSword ? 3.2 : 4.0, t),
        torsoLean: lerp(isSword ? -0.10 : 0.14, 0.28, t),
        headTilt: 0.10,
        stanceSpread: 2.8,
        armForward: lerp(isSword ? -2.2 : 0.55, -1.55, t),
        wristAngle: lerp(-0.2, 0.42, t),
        sweepSide: lerp(-1.0, 1.0, t),
        slashAlpha: Math.sin(t * Math.PI),
      };
    } else {
      const t = easeOutCubic((p - 0.62) / 0.38);
      return {
        ...neutral,
        squatY: lerp(isSword ? 3.2 : 4.0, 0, t),
        torsoLean: lerp(0.28, 0, t),
        headTilt: lerp(0.10, 0, t),
        stanceSpread: lerp(2.8, 0, t),
        armForward: lerp(-1.55, 0, t),
        wristAngle: lerp(0.42, 0, t),
        sweepSide: lerp(1.0, 0, t),
      };
    }
  }

  if (kind === 'RIFLE') {
    if (p < 0.25) {
      const t = easeOutCubic(p / 0.25);
      return {
        ...neutral,
        squatY: lerp(0, 1.5, t),
        torsoLean: lerp(0, -0.06, t),
        stanceSpread: lerp(0, 2.2, t),
        armForward: lerp(0, -1.52, t),
      };
    } else if (p < 0.65) {
      const t = (p - 0.25) / 0.40;
      const recoil = Math.sin(t * Math.PI) * 0.24;
      return {
        ...neutral,
        squatY: 1.5,
        torsoLean: -0.08 - recoil * 0.4,
        headTilt: 0.05,
        stanceSpread: 2.2,
        armForward: -1.55 - recoil,
        wristAngle: -recoil * 0.35,
      };
    } else {
      const t = easeOutCubic((p - 0.65) / 0.35);
      return {
        ...neutral,
        squatY: lerp(1.5, 0, t),
        torsoLean: lerp(-0.08, 0, t),
        headTilt: lerp(0.05, 0, t),
        stanceSpread: lerp(2.2, 0, t),
        armForward: lerp(-1.55, 0, t),
      };
    }
  }

  if (kind === 'WATER') {
    if (p < 0.22) {
      const t = easeOutCubic(p / 0.22);
      return {
        ...neutral,
        squatY: lerp(0, 1.8, t),
        torsoLean: lerp(0, 0.14, t),
        headTilt: lerp(0, 0.10, t),
        stanceSpread: lerp(0, 1.8, t),
        armForward: lerp(0, -1.05, t),
        wristAngle: lerp(0, 0.12, t),
      };
    } else if (p < 0.78) {
      const t = (p - 0.22) / 0.56;
      const tip = Math.sin(t * Math.PI * 2) * 0.08;
      return {
        ...neutral,
        squatY: 1.8 + Math.sin(t * Math.PI) * 0.8,
        torsoLean: 0.16,
        headTilt: 0.12,
        stanceSpread: 1.8,
        armForward: -1.12 + tip,
        wristAngle: 0.55 + tip,
        pourAlpha: Math.sin(t * Math.PI),
      };
    } else {
      const t = easeOutCubic((p - 0.78) / 0.22);
      return {
        ...neutral,
        squatY: lerp(1.8, 0, t),
        torsoLean: lerp(0.16, 0, t),
        headTilt: lerp(0.12, 0, t),
        stanceSpread: lerp(1.8, 0, t),
        armForward: lerp(-1.12, 0, t),
        wristAngle: lerp(0.55, 0, t),
      };
    }
  }

  if (kind === 'PLANT') {
    if (p < 0.28) {
      const t = easeOutCubic(p / 0.28);
      return {
        ...neutral,
        squatY: lerp(0, 4.8, t),
        torsoLean: lerp(0, 0.28, t),
        headTilt: lerp(0, 0.18, t),
        stanceSpread: lerp(0, 2.2, t),
        armForward: lerp(0, -0.78, t),
      };
    } else if (p < 0.76) {
      const t = (p - 0.28) / 0.48;
      const sow = Math.sin(t * Math.PI * 3) * 0.22;
      return {
        ...neutral,
        squatY: 4.8,
        torsoLean: 0.28,
        headTilt: 0.18,
        stanceSpread: 2.2,
        armForward: -0.68 + sow,
        seedAlpha: 1,
      };
    } else {
      const t = easeOutCubic((p - 0.76) / 0.24);
      return {
        ...neutral,
        squatY: lerp(4.8, 0, t),
        torsoLean: lerp(0.28, 0, t),
        headTilt: lerp(0.18, 0, t),
        stanceSpread: lerp(2.2, 0, t),
        armForward: lerp(-0.68, 0, t),
      };
    }
  }

  if (kind === 'HARVEST') {
    if (p < 0.34) {
      const t = easeOutCubic(p / 0.34);
      return {
        ...neutral,
        squatY: lerp(0, 3.6, t),
        torsoLean: lerp(0, 0.26, t),
        headTilt: lerp(0, 0.14, t),
        stanceSpread: lerp(0, 2.0, t),
        armForward: lerp(0, -1.18, t),
      };
    } else if (p < 0.68) {
      const t = easeOutBack((p - 0.34) / 0.34);
      return {
        ...neutral,
        squatY: lerp(3.6, 0.4, Math.min(1, t)),
        torsoLean: lerp(0.26, -0.06, Math.min(1, t)),
        headTilt: lerp(0.14, -0.04, Math.min(1, t)),
        stanceSpread: 2.0,
        armForward: lerp(-1.18, -0.42, Math.min(1, t)),
      };
    } else {
      const t = easeOutCubic((p - 0.68) / 0.32);
      return {
        ...neutral,
        squatY: lerp(0.4, 0, t),
        torsoLean: lerp(-0.06, 0, t),
        headTilt: lerp(-0.04, 0, t),
        stanceSpread: lerp(2.0, 0, t),
        armForward: lerp(-0.42, 0, t),
      };
    }
  }

  // CONSUME
  if (p < 0.26) {
    const t = easeOutCubic(p / 0.26);
    return {
      ...neutral,
      torsoLean: lerp(0, -0.05, t),
      headTilt: lerp(0, -0.14, t),
      armForward: lerp(0, -2.15, t),
    };
  } else if (p < 0.78) {
    const t = (p - 0.26) / 0.52;
    const chew = Math.sin(t * Math.PI * 4) * 0.08;
    return {
      ...neutral,
      squatY: Math.abs(chew) * 4,
      torsoLean: -0.06,
      headTilt: -0.15 + chew,
      armForward: -2.18 + chew,
    };
  } else {
    const t = easeOutCubic((p - 0.78) / 0.22);
    return {
      ...neutral,
      torsoLean: lerp(-0.06, 0, t),
      headTilt: lerp(-0.15, 0, t),
      armForward: lerp(-2.18, 0, t),
    };
  }
}

function drawSandalFoot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  facingSide: boolean,
  showHeelLift = false
) {
  ctx.save();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';

  if (showHeelLift) {
    // Back-view stepping sandal sole visible as heel lifts
    ctx.fillStyle = SANDAL_DARK;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - 0.5, w, 5.4, 2.0);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = SANDAL_BLUE;
    ctx.fillRect(x - w / 2 + 1.2, y - 0.5, w - 2.4, 1.8);
    ctx.restore();
    return;
  }

  // Contoured dark sole
  ctx.fillStyle = SANDAL_DARK;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y + 2.4, w, 3.4, 1.6);
  ctx.fill();
  ctx.stroke();

  // Warm tan foot & toes peeking forward
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.roundRect(x - w / 2 + 0.8, y, w - 1.6, 3.2, 1.5);
  ctx.fill();
  ctx.stroke();

  // Toe divider notches (front view)
  if (!facingSide) {
    ctx.strokeStyle = SKIN_SHADE;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(x - 1.5, y + 1.2);
    ctx.lineTo(x - 1.5, y + 2.7);
    ctx.moveTo(x + 1.5, y + 1.2);
    ctx.lineTo(x + 1.5, y + 2.7);
    ctx.stroke();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.5;
  }

  // Two-tone blue straps across instep
  ctx.fillStyle = SANDAL_BLUE;
  if (facingSide) {
    ctx.beginPath();
    ctx.roundRect(x - w / 2 + 0.4, y - 0.6, w * 0.58, 3.1, 1.2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SANDAL_LIGHT;
    ctx.fillRect(x - w / 2 + 1.3, y - 0.1, w * 0.34, 1.1);
  } else {
    ctx.beginPath();
    ctx.roundRect(x - w / 2 + 0.7, y - 0.8, w - 1.4, 2.7, 1.1);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SANDAL_LIGHT;
    ctx.fillRect(x - w / 2 + 1.8, y - 0.3, w - 3.6, 1.0);
  }
  ctx.restore();
}

function drawOrganicHairCrown(
  ctx: CanvasRenderingContext2D,
  yHeadCenter: number,
  hairBounce: number
) {
  ctx.save();
  ctx.translate(0, hairBounce);
  ctx.fillStyle = HAIR;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';

  // Curved natural sweeping spiky silhouette
  ctx.beginPath();
  ctx.moveTo(-10.5, yHeadCenter + 2.5);
  ctx.quadraticCurveTo(-15.5, yHeadCenter - 1, -13, yHeadCenter - 6);
  ctx.quadraticCurveTo(-14.5, yHeadCenter - 11.5, -8, yHeadCenter - 12);
  ctx.quadraticCurveTo(-6.5, yHeadCenter - 17.5, -2.5, yHeadCenter - 16.5);
  ctx.quadraticCurveTo(0, yHeadCenter - 13.5, 2, yHeadCenter - 14.5);
  ctx.quadraticCurveTo(5.5, yHeadCenter - 17, 7.5, yHeadCenter - 12);
  ctx.quadraticCurveTo(14, yHeadCenter - 11.5, 12.5, yHeadCenter - 6);
  ctx.quadraticCurveTo(15.5, yHeadCenter - 1, 10.5, yHeadCenter + 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawHeldToolAtHand(
  ctx: CanvasRenderingContext2D,
  kind: PlayerActionKind,
  wristAngle: number,
  pose: ActionPose,
  params: FarmerDrawParams
) {
  ctx.save();
  ctx.rotate(wristAngle);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (kind === 'HOE') {
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.roundRect(-2.2, -5, 4.4, 27, 1.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = params.hasSteelHoe ? '#7DD3FC' : '#CBD5E1';
    ctx.beginPath();
    ctx.roundRect(-1.5, 19, 10.5, 4.8, 1.4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = params.hasSteelHoe ? '#E0F2FE' : '#F8FAFC';
    ctx.fillRect(4.5, 20.2, 3.5, 2.2);
  } else if (kind === 'AXE') {
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.roundRect(-2.2, -5, 4.4, 26, 1.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(1.5, 13);
    ctx.lineTo(10.5, 11);
    ctx.quadraticCurveTo(12.5, 17, 10.5, 23);
    ctx.lineTo(1.5, 21);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(9.8, 12.2);
    ctx.quadraticCurveTo(11.4, 17, 9.8, 21.8);
    ctx.stroke();
  } else if (kind === 'SCYTHE') {
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.roundRect(-2, -4, 4, 16, 1.4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(-1, 11);
    ctx.quadraticCurveTo(13, 12, 14, 24);
    ctx.quadraticCurveTo(7, 17, 1, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'SWORD') {
    // Leather hilt & brass crossguard
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.roundRect(-2, -5, 4, 8, 1.4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(-5.5, 2, 11, 3.2, 1.2);
    ctx.fill();
    ctx.stroke();

    // Gleaming lab steel blade
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(-2.5, 5);
    ctx.lineTo(2.5, 5);
    ctx.lineTo(2.0, 23);
    ctx.lineTo(0, 27);
    ctx.lineTo(-2.0, 23);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#E0F2FE';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(0, 23);
    ctx.stroke();
  } else if (kind === 'RIFLE') {
    // Walnut stock + dark iron barrel pointing forward (+Y becomes forward when armForward ~ -1.55)
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.roundRect(-3.2, -3, 6.4, 9, 1.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(-2.4, 5, 4.8, 16, 1.2);
    ctx.fill();
    ctx.stroke();

    // Brass energy core on rifle
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-1.6, 8, 3.2, 5.5);

    if (params.actionProgress > 0.22 && params.actionProgress < 0.44) {
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(0, 23, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'WATER') {
    ctx.rotate(-Math.PI * 0.35);
    const bodyColor = params.hasBigWateringCan ? '#F59E0B' : '#0284C7';
    const lightColor = params.hasBigWateringCan ? '#FDE68A' : '#38BDF8';

    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 1, 5, Math.PI * 0.9, Math.PI * 2.1);
    ctx.stroke();

    ctx.fillStyle = bodyColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-5.5, 2, 11, 11, 2.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = lightColor;
    ctx.fillRect(-3.8, 4, 7.6, 3);

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(4.5, 9);
    ctx.lineTo(13.5, 3);
    ctx.lineTo(14.5, 6);
    ctx.lineTo(5.5, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (pose.pourAlpha > 0.15) {
      ctx.save();
      ctx.globalAlpha = pose.pourAlpha;
      ctx.fillStyle = '#7DD3FC';
      for (let i = 0; i < 4; i++) {
        const dropT = (params.elapsedTime * 7 + i * 0.25) % 1;
        const dx = 15 + dropT * 8;
        const dy = 5 + dropT * 18;
        ctx.beginPath();
        ctx.ellipse(dx, dy, 1.7, 2.6, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  } else if (kind === 'PLANT') {
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.roundRect(-3, -2, 6, 6.5, 1.5);
    ctx.fill();
    ctx.stroke();

    if (pose.seedAlpha > 0) {
      ctx.fillStyle = '#BEF264';
      for (let i = 0; i < 3; i++) {
        const st = (params.elapsedTime * 6 + i * 0.33) % 1;
        ctx.beginPath();
        ctx.arc((i - 1) * 3.5, 6 + st * 12, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (kind === 'CONSUME') {
    const isCoffee = params.selectedItemId.includes('kopi');
    const isJamuOrWater =
      params.selectedItemId.includes('jamu') || params.selectedItemId.includes('kelapa');
    if (isCoffee || isJamuOrWater) {
      ctx.fillStyle = isCoffee ? '#78350F' : '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(-3.2, -1, 6.4, 7.5, 1.6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-3.2, -1, 6.4, 2);
    } else {
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(0, 2, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Draws an articulated 2-segment arm (sleeve + bicep + elbow + forearm + hand)
 */
function drawArticulatedArm(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  upperRot: number,
  elbowBend: number,
  isBackLayer: boolean,
  sideMirror: number, // -1 for left side in front/back view, +1 for right/side
  heldAction?: {
    kind: PlayerActionKind;
    wristAngle: number;
    pose: ActionPose;
    params: FarmerDrawParams;
  }
) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(upperRot);

  // Short white T-shirt sleeve (tapered shoulder cap)
  ctx.fillStyle = isBackLayer ? SHIRT_SHADE : SHIRT;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.55;
  ctx.beginPath();
  ctx.moveTo(-3.1, -1.2);
  ctx.quadraticCurveTo(0, -2.8, 3.1, -1.2);
  ctx.lineTo(3.4, 6.2);
  ctx.quadraticCurveTo(0, 7.0, -3.4, 6.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Upper arm skin peeking out of sleeve
  ctx.fillStyle = isBackLayer ? SKIN_SHADE : SKIN;
  ctx.beginPath();
  ctx.roundRect(-2.4, 5.2, 4.8, 5.2, 1.8);
  ctx.fill();
  ctx.stroke();

  // Elbow joint -> Forearm + Hand
  ctx.save();
  ctx.translate(0, 9.5);
  ctx.rotate(elbowBend);

  ctx.fillStyle = isBackLayer ? SKIN_SHADE : SKIN;
  ctx.beginPath();
  ctx.roundRect(-2.2, -0.5, 4.4, 7.2, 2.0);
  ctx.fill();
  ctx.stroke();

  // Shading along inner forearm
  if (!isBackLayer) {
    ctx.fillStyle = SKIN_SHADE;
    ctx.fillRect(sideMirror > 0 ? -1.4 : 0.4, 1.0, 1.1, 4.5);
  }

  // Hand / Fist
  ctx.fillStyle = isBackLayer ? SKIN_SHADE : SKIN;
  ctx.beginPath();
  ctx.arc(0, 7.2, 2.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (heldAction) {
    ctx.save();
    ctx.translate(0, 7.2);
    drawHeldToolAtHand(
      ctx,
      heldAction.kind,
      heldAction.wristAngle,
      heldAction.pose,
      heldAction.params
    );
    ctx.restore();
  }

  ctx.restore();
  ctx.restore();
}

export function drawFarmerCharacter(ctx: CanvasRenderingContext2D, params: FarmerDrawParams) {
  const {
    x: playerScreenX,
    y: playerScreenY,
    facingDir,
    walkCycle,
    isMoving,
    actionKind,
    actionProgress,
    isBathing,
    elapsedTime,
  } = params;

  if (isBathing) {
    // Relaxed chest-deep soak inside the warm pool!
    const floatBob = Math.sin(elapsedTime * 2.4) * 1.1;
    ctx.save();
    ctx.translate(playerScreenX, playerScreenY + floatBob);
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Submerged shadow & warm ripples around chest
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.72)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, -10, 15 + Math.sin(elapsedTime * 3) * 2, 5.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Bare relaxed shoulders & upper chest above waterline
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.6;
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.roundRect(-10.5, -20, 21, 11, [7, 7, 2, 2]);
    ctx.fill();
    ctx.stroke();

    // Waterline clip band over lower chest
    ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, -10, 13.5, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck & Head
    ctx.fillStyle = SKIN_SHADE;
    ctx.fillRect(-3.1, -24, 6.2, 4.5);

    drawOrganicHairCrown(ctx, -32.5, 0);

    // Face
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.moveTo(-9.4, -35.5);
    ctx.quadraticCurveTo(-9.4, -41.2, 0, -41.2);
    ctx.quadraticCurveTo(9.4, -41.2, 9.4, -35.5);
    ctx.quadraticCurveTo(9.4, -26.5, 5.2, -24.0);
    ctx.quadraticCurveTo(0, -22.2, -5.2, -24.0);
    ctx.quadraticCurveTo(-9.4, -26.5, -9.4, -35.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Warm rosy steam blush
    ctx.fillStyle = 'rgba(251, 113, 133, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-5.2, -29.2, 2.4, 1.3, 0, 0, Math.PI * 2);
    ctx.ellipse(5.2, -29.2, 2.4, 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Relaxed happy closed eyes (^ ^) & peaceful smile
    ctx.strokeStyle = '#181C24';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6.5, -32.5);
    ctx.quadraticCurveTo(-4.2, -34.6, -1.9, -32.5);
    ctx.moveTo(1.9, -32.5);
    ctx.quadraticCurveTo(4.2, -34.6, 6.5, -32.5);
    ctx.stroke();

    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-2.8, -26.4);
    ctx.quadraticCurveTo(0, -25.0, 2.8, -26.4);
    ctx.stroke();

    // Thick brows & messy hair bangs
    ctx.strokeStyle = '#12151B';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-7.2, -36.5);
    ctx.lineTo(-1.8, -35.8);
    ctx.moveTo(7.2, -36.5);
    ctx.lineTo(1.8, -35.8);
    ctx.stroke();

    ctx.fillStyle = HAIR;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.55;
    ctx.beginPath();
    ctx.moveTo(-10.5, -33.5);
    ctx.quadraticCurveTo(-13.2, -37.5, -11.5, -40.5);
    ctx.quadraticCurveTo(-9.5, -44.5, -5.0, -48.2);
    ctx.quadraticCurveTo(-1.5, -45.5, 0.8, -44.8);
    ctx.quadraticCurveTo(4.0, -47.5, 6.2, -47.8);
    ctx.quadraticCurveTo(10.5, -43.5, 11.8, -39.5);
    ctx.quadraticCurveTo(13.0, -36.5, 9.8, -33.8);
    ctx.quadraticCurveTo(7.8, -37.5, 6.6, -37.8);
    ctx.quadraticCurveTo(5.2, -35.2, 4.2, -35.0);
    ctx.quadraticCurveTo(2.4, -39.0, 1.2, -39.5);
    ctx.quadraticCurveTo(-0.5, -35.0, -1.8, -35.0);
    ctx.quadraticCurveTo(-3.8, -38.2, -4.8, -38.2);
    ctx.quadraticCurveTo(-7.2, -34.5, -10.5, -33.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    return;
  }

  const isActing = actionKind !== 'NONE' && actionProgress > 0;
  const pose = computeActionPose(actionKind, actionProgress);

  // Smooth walk cycle & idle breathing + natural eye blink
  const phase = isMoving && !isActing ? walkCycle * 11.2 : 0;
  const stride = isMoving && !isActing ? Math.sin(phase) : 0;
  const stepLift = isMoving && !isActing ? Math.cos(phase) : 0;
  const idleBreath = !isMoving && !isActing ? Math.sin(elapsedTime * 2.3) : 0;

  // Natural blink every ~3.8 seconds for 0.14s
  const blinkMod = elapsedTime % 3.85;
  const isBlinking = blinkMod > 3.71 && !isActing;

  const bob =
    isMoving && !isActing
      ? Math.abs(Math.cos(phase)) * 2.1
      : isActing
      ? 0
      : idleBreath * 0.55;

  const hairBounce = isMoving && !isActing ? -Math.abs(Math.cos(phase)) * 0.9 : idleBreath * 0.25;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(
    playerScreenX,
    playerScreenY + 3,
    13.2 + pose.stanceSpread * 0.9 - bob * 0.35,
    5.0 + pose.stanceSpread * 0.15,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.save();
  ctx.translate(playerScreenX, playerScreenY - bob);

  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (facingDir === 'DOWN' || facingDir === 'UP') {
    const isFront = facingDir === 'DOWN';
    // Stride mechanics for front/back: advancing foot drops slightly lower, trailing lifts cleanly
    const stepL = isMoving && !isActing ? stride : 0;
    const stepR = isMoving && !isActing ? -stride : 0;
    const liftL = isMoving && !isActing ? Math.max(0, -stepL) * 4.2 : 0;
    const liftR = isMoving && !isActing ? Math.max(0, -stepR) * 4.2 : 0;
    const fwdDropL = isMoving && !isActing ? Math.max(0, stepL) * 1.3 : 0;
    const fwdDropR = isMoving && !isActing ? Math.max(0, stepR) * 1.3 : 0;

    const armSwingL = isMoving && !isActing ? stride * 0.32 : idleBreath * 0.025;
    const armSwingR = isMoving && !isActing ? -stride * 0.32 : -idleBreath * 0.025;
    const elbowWalkL = isMoving && !isActing ? Math.max(0, stride) * 0.26 + 0.08 : 0.08;
    const elbowWalkR = isMoving && !isActing ? Math.max(0, -stride) * 0.26 + 0.08 : 0.08;
    const walkTilt = isMoving && !isActing ? stride * 0.026 : 0;
    const walkSwayX = isMoving && !isActing ? stride * 0.7 : 0;

    // --- 1. ARTICULATED LEGS & SANDALS ---
    const footSpread = pose.stanceSpread;
    const hipY = -19.5 + pose.squatY;

    const drawFrontBackLeg = (
      side: 'L' | 'R',
      lift: number,
      fwdDrop: number,
      isAdvancing: boolean
    ) => {
      const sign = side === 'L' ? -1 : 1;
      const xCenter = sign * (4.7 + footSpread * 0.5);
      const ankleY = -3.0 - lift + fwdDrop;
      const legHeight = Math.max(10.5, ankleY - hipY + 1.5);

      // Tapered jeans leg
      ctx.fillStyle = isAdvancing || !isMoving ? PANTS : PANTS_SHADE;
      ctx.beginPath();
      ctx.roundRect(xCenter - 3.7, hipY, 7.4, legHeight, 2.2);
      ctx.fill();
      ctx.stroke();

      // Inner seam / knee crease highlight
      ctx.fillStyle = isAdvancing || !isMoving ? PANTS_LIGHT : PANTS;
      ctx.fillRect(xCenter - (side === 'L' ? 0.2 : 1.6), hipY + 2, 1.8, Math.max(3, legHeight - 5));

      // Rolled ankle cuff
      ctx.fillStyle = PANTS_SHADE;
      ctx.fillRect(xCenter - 3.3, ankleY - 2.2, 6.6, 2.0);

      // Sandal (show sole lifting in back view when trailing foot lifts)
      drawSandalFoot(
        ctx,
        xCenter,
        ankleY,
        isAdvancing ? 9.0 : 8.5,
        false,
        !isFront && lift > 1.8
      );
    };

    if (stepL >= stepR) {
      drawFrontBackLeg('R', liftR, fwdDropR, false);
      drawFrontBackLeg('L', liftL, fwdDropL, true);
    } else {
      drawFrontBackLeg('L', liftL, fwdDropL, false);
      drawFrontBackLeg('R', liftR, fwdDropR, true);
    }

    // --- Arm angles for Front/Back View ---
    let leftArmRot = armSwingL + 0.08;
    let rightArmRot = armSwingR - 0.08;
    let leftElbow = elbowWalkL;
    let rightElbow = -elbowWalkR;
    let showToolInRightHand = false;
    let toolWristAngle = pose.wristAngle;

    const passiveWeaponKind: PlayerActionKind | null =
      params.selectedItemId === 'weapon_sword'
        ? 'SWORD'
        : params.selectedItemId === 'weapon_rifle'
        ? 'RIFLE'
        : null;

    if (!isActing && passiveWeaponKind) {
      showToolInRightHand = true;
      toolWristAngle = passiveWeaponKind === 'RIFLE' ? -0.35 : 0.1;
    }

    if (isActing) {
      if (actionKind === 'HOE' || actionKind === 'AXE') {
        showToolInRightHand = true;
        if (isFront) {
          const p = pose.frontArcArm;
          const mag = p < 0 ? lerp(0.25, 2.65, -p) : lerp(0.25, 0.38, p);
          leftArmRot = p < 0 ? -mag : -0.35;
          rightArmRot = p < 0 ? mag : 0.35;
          leftElbow = 0.15;
          rightElbow = -0.15;
          toolWristAngle = p < 0 ? -0.6 : 0.15;
        } else {
          const p = pose.frontArcArm;
          if (p < 0) {
            const mag = lerp(0.3, 2.75, -p);
            leftArmRot = -mag;
            rightArmRot = mag;
            toolWristAngle = 0.2;
          } else {
            leftArmRot = -2.4;
            rightArmRot = 2.65 - p * 0.35;
            toolWristAngle = -0.35;
          }
        }
      } else if (actionKind === 'SCYTHE' || actionKind === 'SWORD') {
        showToolInRightHand = true;
        rightArmRot = lerp(-1.45, 1.25, (pose.sweepSide + 1) * 0.5);
        leftArmRot = -0.25;
        rightElbow = -0.25;
        toolWristAngle = isFront ? -0.45 : -Math.PI + 0.45;
      } else if (actionKind === 'RIFLE') {
        showToolInRightHand = true;
        rightArmRot = isFront ? 0.15 : -2.6;
        leftArmRot = isFront ? -0.35 : 2.3;
        rightElbow = isFront ? 0.25 : -0.25;
        toolWristAngle = isFront ? 0.0 : 0.0;
      } else if (actionKind === 'WATER') {
        showToolInRightHand = true;
        rightArmRot = isFront ? 0.55 : -2.25;
        leftArmRot = isFront ? -0.18 : 0.18;
        rightElbow = isFront ? 0.22 : -0.15;
        toolWristAngle = isFront ? 0.25 : -0.2;
      } else if (actionKind === 'PLANT' || actionKind === 'HARVEST') {
        showToolInRightHand = actionKind === 'PLANT';
        leftArmRot = isFront ? -0.42 : -2.45;
        rightArmRot = isFront ? 0.42 : 2.45;
      } else if (actionKind === 'CONSUME') {
        showToolInRightHand = true;
        rightArmRot = isFront ? 2.25 : -2.1;
        leftArmRot = 0.08;
        rightElbow = isFront ? 0.25 : -0.2;
        toolWristAngle = isFront ? -2.2 : 1.9;
      }
    }

    // --- 2. UPPER BODY RIG ---
    ctx.save();
    ctx.translate(walkSwayX, hipY);
    ctx.rotate(walkTilt);

    // Belt & Waistband
    ctx.fillStyle = PANTS_SHADE;
    ctx.beginPath();
    ctx.roundRect(-8.8, -1.8, 17.6, 4.2, 1.6);
    ctx.fill();
    ctx.stroke();

    // Front pocket arcs on jeans
    if (isFront) {
      ctx.strokeStyle = PANTS_LIGHT;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(-6.4, 2.2, 3.0, 0, Math.PI * 0.55);
      ctx.moveTo(6.4, 2.2);
      ctx.arc(6.4, 2.2, 3.0, Math.PI * 0.45, Math.PI);
      ctx.stroke();
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.6;
    }

    const drawArmsBehind =
      !isFront &&
      isActing &&
      (actionKind === 'PLANT' ||
        actionKind === 'HARVEST' ||
        actionKind === 'WATER' ||
        actionKind === 'SCYTHE' ||
        actionKind === 'SWORD' ||
        actionKind === 'RIFLE' ||
        ((actionKind === 'HOE' || actionKind === 'AXE') && pose.frontArcArm >= 0));

    const frontBackHeldAction = showToolInRightHand
      ? {
          kind: isActing ? actionKind : (passiveWeaponKind ?? actionKind),
          wristAngle: toolWristAngle,
          pose,
          params,
        }
      : undefined;

    if (drawArmsBehind) {
      drawArticulatedArm(ctx, -10.8, -15.5, leftArmRot, leftElbow, false, -1);
      drawArticulatedArm(
        ctx,
        10.8,
        -15.5,
        rightArmRot,
        rightElbow,
        false,
        1,
        frontBackHeldAction
      );
    }

    const torsoSquash = 1 - Math.abs(pose.torsoLean) * 0.14;
    ctx.save();
    ctx.scale(1, torsoSquash);

    if (!drawArmsBehind && !isActing) {
      drawArticulatedArm(ctx, -10.8, -15.5, leftArmRot, leftElbow, false, -1);
      drawArticulatedArm(ctx, 10.8, -15.5, rightArmRot, rightElbow, false, 1);
    }

    // --- 3. TAPERED WHITE CREWNECK T-SHIRT ---
    ctx.fillStyle = SHIRT;
    ctx.beginPath();
    ctx.moveTo(-10.2, -16.5);
    ctx.quadraticCurveTo(0, -18.8, 10.2, -16.5);
    ctx.lineTo(9.0, -1.2);
    ctx.quadraticCurveTo(0, 0.5, -9.0, -1.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Soft cel-shaded shirt folds (side/hem shading matching reference!)
    ctx.fillStyle = SHIRT_SHADE;
    ctx.beginPath();
    ctx.moveTo(-8.4, -4.5);
    ctx.quadraticCurveTo(0, -2.5, 8.4, -4.5);
    ctx.lineTo(8.5, -1.3);
    ctx.quadraticCurveTo(0, 0.2, -8.5, -1.3);
    ctx.closePath();
    ctx.fill();

    // Chest subtle crease
    ctx.strokeStyle = SHIRT_DEEP;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-5.8, -11.5);
    ctx.quadraticCurveTo(-4.8, -9.0, -6.2, -6.5);
    ctx.moveTo(5.8, -11.5);
    ctx.quadraticCurveTo(4.8, -9.0, 6.2, -6.5);
    ctx.stroke();

    // Crewneck collar rim
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = isFront ? SKIN_SHADE : SHIRT_SHADE;
    ctx.beginPath();
    ctx.ellipse(0, -17.0, 4.6, 2.2, 0, 0, Math.PI * (isFront ? 1 : 2));
    ctx.fill();
    ctx.stroke();

    // --- 4. NECK & EXPRESSIVE HEAD ---
    const headShiftY = pose.headTilt * 8 + idleBreath * 0.25;
    ctx.fillStyle = SKIN_SHADE;
    ctx.fillRect(-3.1, -20.5, 6.2, 3.8);

    ctx.save();
    ctx.translate(0, headShiftY);

    // Ears
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.arc(-9.8, -27.5, 2.4, 0, Math.PI * 2);
    ctx.arc(9.8, -27.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (isFront) {
      drawOrganicHairCrown(ctx, -28.5, hairBounce);

      // Tapered jawline face
      ctx.fillStyle = SKIN;
      ctx.beginPath();
      ctx.moveTo(-9.4, -31.5);
      ctx.quadraticCurveTo(-9.4, -37.2, 0, -37.2);
      ctx.quadraticCurveTo(9.4, -37.2, 9.4, -31.5);
      ctx.quadraticCurveTo(9.4, -22.5, 5.2, -20.0);
      ctx.quadraticCurveTo(0, -18.2, -5.2, -20.0);
      ctx.quadraticCurveTo(-9.4, -22.5, -9.4, -31.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Chin & cheek warm highlight
      ctx.fillStyle = SKIN_LIGHT;
      ctx.beginPath();
      ctx.ellipse(-4.8, -25.2, 2.0, 1.1, 0.15, 0, Math.PI * 2);
      ctx.ellipse(4.8, -25.2, 2.0, 1.1, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Subtle nose curve
      ctx.strokeStyle = SKIN_SHADE;
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      ctx.arc(0, -25.6, 1.2, 0.15, Math.PI - 0.15);
      ctx.stroke();

      // Confident friendly smile (matches portrait)
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-3.4, -22.4);
      ctx.quadraticCurveTo(0.2, -21.0, 3.6, -22.6);
      ctx.stroke();

      // Expressive eyes (with natural blink!)
      if (isBlinking) {
        ctx.strokeStyle = '#181C24';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-6.5, -28.8);
        ctx.quadraticCurveTo(-4.2, -27.8, -1.9, -28.8);
        ctx.moveTo(1.9, -28.8);
        ctx.quadraticCurveTo(4.2, -27.8, 6.5, -28.8);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-4.3, -28.8, 2.6, 2.8, 0, 0, Math.PI * 2);
        ctx.ellipse(4.3, -28.8, 2.6, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1B2028';
        ctx.beginPath();
        ctx.arc(-4.0, -28.8, 1.95, 0, Math.PI * 2);
        ctx.arc(4.0, -28.8, 1.95, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-4.7, -29.8, 0.8, 0, Math.PI * 2);
        ctx.arc(3.3, -29.8, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Thick angled eyebrows (signature portrait look)
      ctx.strokeStyle = '#12151B';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(-7.3, -32.7);
      ctx.quadraticCurveTo(-4.4, -33.2, -1.7, -31.8);
      ctx.moveTo(7.3, -32.7);
      ctx.quadraticCurveTo(4.4, -33.2, 1.7, -31.8);
      ctx.stroke();

      // Curved messy front bangs
      ctx.save();
      ctx.translate(0, hairBounce);
      ctx.fillStyle = HAIR;
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.55;
      ctx.beginPath();
      ctx.moveTo(-10.5, -29.5);
      ctx.quadraticCurveTo(-13.2, -33.5, -11.5, -36.5);
      ctx.quadraticCurveTo(-9.5, -40.5, -5.0, -44.2);
      ctx.quadraticCurveTo(-1.5, -41.5, 0.8, -40.8);
      ctx.quadraticCurveTo(4.0, -43.5, 6.2, -43.8);
      ctx.quadraticCurveTo(10.5, -39.5, 11.8, -35.5);
      ctx.quadraticCurveTo(13.0, -32.5, 9.8, -29.8);
      ctx.quadraticCurveTo(7.8, -33.5, 6.6, -33.8);
      ctx.quadraticCurveTo(5.2, -31.2, 4.2, -31.0);
      ctx.quadraticCurveTo(2.4, -35.0, 1.2, -35.5);
      ctx.quadraticCurveTo(-0.5, -31.0, -1.8, -31.0);
      ctx.quadraticCurveTo(-3.8, -34.2, -4.8, -34.2);
      ctx.quadraticCurveTo(-7.2, -30.5, -10.5, -29.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sleek cel hair shine
      ctx.strokeStyle = HAIR_LIGHT;
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      ctx.moveTo(-5.5, -37.8);
      ctx.quadraticCurveTo(0, -39.8, 5.5, -37.3);
      ctx.stroke();
      ctx.restore();
    } else {
      // UP (Back view)
      ctx.fillStyle = SKIN;
      ctx.beginPath();
      ctx.roundRect(-9.2, -37.0, 18.4, 18.0, [9, 9, 8.5, 8.5]);
      ctx.fill();
      ctx.stroke();

      drawOrganicHairCrown(ctx, -28.5, hairBounce);

      ctx.save();
      ctx.translate(0, hairBounce);
      ctx.fillStyle = HAIR;
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-10.2, -30.5);
      ctx.quadraticCurveTo(-11.2, -20.5, -6.5, -19.8);
      ctx.quadraticCurveTo(-4.0, -21.5, -2.5, -21.8);
      ctx.quadraticCurveTo(-0.8, -19.5, 0, -19.4);
      ctx.quadraticCurveTo(1.2, -21.5, 3.0, -21.8);
      ctx.quadraticCurveTo(5.2, -20.0, 7.0, -19.8);
      ctx.quadraticCurveTo(11.2, -20.5, 10.2, -30.5);
      ctx.quadraticCurveTo(0, -38.8, -10.2, -30.5);
      ctx.fill();
      ctx.stroke();

      // Subtle hair contour & sheen
      ctx.strokeStyle = HAIR_SHADE;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5.5, -24.5);
      ctx.quadraticCurveTo(-3.5, -22, -2.5, -21.8);
      ctx.moveTo(5.5, -24.5);
      ctx.quadraticCurveTo(3.5, -22, 2.8, -21.8);
      ctx.stroke();

      ctx.strokeStyle = HAIR_LIGHT;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -30.5, 6.2, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore(); // end head

    if (!drawArmsBehind && isActing) {
      drawArticulatedArm(ctx, -10.8, -15.5, leftArmRot, leftElbow, false, -1);
      drawArticulatedArm(
        ctx,
        10.8,
        -15.5,
        rightArmRot,
        rightElbow,
        false,
        1,
        frontBackHeldAction
      );
    }

    if (pose.slashAlpha > 0.05) {
      ctx.save();
      ctx.globalAlpha = pose.slashAlpha * 0.72;
      ctx.strokeStyle =
        actionKind === 'SWORD' ? '#38BDF8' : actionKind === 'SCYTHE' ? '#F8FAFC' : '#FDE047';
      ctx.lineWidth = actionKind === 'SWORD' ? 4.2 : 3.5;
      ctx.beginPath();
      if (actionKind === 'SCYTHE' || actionKind === 'SWORD') {
        const arcY = isFront ? 5 : -36;
        ctx.arc(
          0,
          arcY,
          actionKind === 'SWORD' ? 26 : 22,
          isFront ? 0.25 : Math.PI + 0.25,
          isFront ? Math.PI - 0.25 : Math.PI * 2 - 0.25
        );
      } else {
        ctx.arc(0, isFront ? -6 : -44, 19, -Math.PI * 0.8, -Math.PI * 0.2);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore(); // end torsoSquash
    ctx.restore(); // end hipY
  } else {
    // --- LEFT / RIGHT SIDE PROFILE (+X is always forward) ---
    const dir = facingDir === 'LEFT' ? -1 : 1;
    ctx.scale(dir, 1);

    // 2-segment articulated walk gait for realistic knee bend & heel peel!
    const hipY = -19.5 + pose.squatY;
    const drawSideLeg = (isFrontLeg: boolean, phaseOffset: number) => {
      const legPhase = isMoving && !isActing ? phase + phaseOffset : 0;
      const swing = isMoving && !isActing ? Math.sin(legPhase) : 0;
      const cosP = isMoving && !isActing ? Math.cos(legPhase) : 0;

      // Thigh angle from hip (+swing forward/back, note in ctx.scale(dir,1), -rot points +X forward!)
      const thighAngle = isActing
        ? isFrontLeg
          ? -0.20 - pose.stanceSpread * 0.04
          : 0.18 + pose.stanceSpread * 0.04
        : -swing * 0.42;

      // Knee bends smoothly when leg swings forward through passing phase
      const kneeAngle = isActing
        ? pose.squatY * 0.10
        : isMoving
        ? Math.max(0, cosP * 0.52 + (swing > 0 ? 0.12 : 0))
        : 0.03;

      const thighLen = Math.max(6.2, 9.6 - pose.squatY * 0.45);
      const shinLen = Math.max(6.2, 9.4 - pose.squatY * 0.4);
      const footTilt = isActing ? 0 : isMoving ? -swing * 0.14 : 0;

      ctx.save();
      ctx.translate(isActing ? (isFrontLeg ? pose.stanceSpread * 0.4 : -pose.stanceSpread * 0.4) : 0, hipY);
      ctx.rotate(thighAngle);

      // Thigh
      ctx.fillStyle = isFrontLeg ? PANTS : PANTS_SHADE;
      ctx.beginPath();
      ctx.roundRect(-3.6, 0, 7.2, thighLen + 1.5, 2.4);
      ctx.fill();
      ctx.stroke();

      // Knee -> Shin -> Sandal
      ctx.save();
      ctx.translate(0, thighLen - 0.5);
      ctx.rotate(kneeAngle);

      ctx.fillStyle = isFrontLeg ? PANTS : PANTS_SHADE;
      ctx.beginPath();
      ctx.roundRect(-3.3, 0, 6.6, shinLen, 2.0);
      ctx.fill();
      ctx.stroke();

      // Cuff shadow
      ctx.fillStyle = PANTS_SHADE;
      ctx.fillRect(-3.0, shinLen - 2.2, 6.0, 2.0);

      ctx.save();
      ctx.translate(1.4, shinLen - 1.2);
      ctx.rotate(footTilt);
      drawSandalFoot(ctx, 0, 0, isFrontLeg ? 9.8 : 9.4, true);
      ctx.restore();

      ctx.restore();
      ctx.restore();
    };

    // Back leg behind front leg
    drawSideLeg(false, Math.PI);
    drawSideLeg(true, 0);

    // --- UPPER BODY RIG (Hip -> Torso Lean -> Arms & Head move cohesively!) ---
    ctx.save();
    ctx.translate(0, hipY);
    const bodyLean = isActing
      ? pose.torsoLean
      : isMoving
      ? 0.045 + Math.abs(stride) * 0.02
      : idleBreath * 0.01;
    ctx.rotate(bodyLean);

    const walkArmSwingF = isMoving && !isActing ? stride * 0.46 : idleBreath * 0.03;
    const walkArmSwingB = isMoving && !isActing ? -stride * 0.46 : -idleBreath * 0.03;
    const walkElbowF = isMoving && !isActing ? (stride < 0 ? -0.35 : -0.10) : -0.08;
    const walkElbowB = isMoving && !isActing ? (stride > 0 ? -0.35 : -0.10) : -0.08;

    const backArmRot = isActing
      ? pose.armForward - (actionKind === 'CONSUME' ? -1.9 : 0.14)
      : walkArmSwingB;
    const frontArmRot = isActing ? pose.armForward : walkArmSwingF;

    // 1. Back arm (behind torso)
    drawArticulatedArm(
      ctx,
      0.5,
      -15.5,
      backArmRot,
      isActing ? -0.12 : walkElbowB,
      true,
      1
    );

    // 2. Tapered Torso (White T-shirt profile)
    ctx.fillStyle = SHIRT;
    ctx.beginPath();
    ctx.moveTo(-6.8, -16.5);
    ctx.quadraticCurveTo(0, -18.5, 6.8, -16.5);
    ctx.lineTo(6.3, -1.0);
    ctx.quadraticCurveTo(0, 0.5, -6.3, -1.0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = SHIRT_SHADE;
    ctx.fillRect(-5.4, -3.2, 10.8, 2.3);

    // Waistband belt
    ctx.fillStyle = PANTS_SHADE;
    ctx.beginPath();
    ctx.roundRect(-6.4, -1.6, 12.8, 3.6, 1.4);
    ctx.fill();
    ctx.stroke();

    // 3. Neck & Side Profile Head
    ctx.fillStyle = SKIN_SHADE;
    ctx.fillRect(-2.7, -20.5, 5.4, 4.0);

    ctx.save();
    ctx.translate(0, -19 + idleBreath * 0.2);
    ctx.rotate(pose.headTilt);

    // Contoured profile face with nose bridge & chin
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.moveTo(-8.2, -12.5);
    ctx.quadraticCurveTo(-8.2, -18.2, 0.5, -18.2);
    ctx.quadraticCurveTo(8.5, -18.2, 9.0, -12.0);
    ctx.lineTo(10.0, -8.5);
    ctx.lineTo(8.8, -7.6);
    ctx.quadraticCurveTo(8.5, -1.8, 4.0, -0.2);
    ctx.quadraticCurveTo(-4.0, 0.6, -8.2, -5.0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye (with blink) + Brow + Smile
    if (isBlinking) {
      ctx.strokeStyle = '#181C24';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(4.0, -10.2);
      ctx.quadraticCurveTo(6.0, -9.4, 7.8, -10.2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(5.8, -10.2, 2.0, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1B2028';
      ctx.beginPath();
      ctx.arc(6.3, -10.2, 1.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(5.8, -11.0, 0.65, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#12151B';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(3.4, -13.6);
    ctx.quadraticCurveTo(6.0, -13.8, 8.2, -12.9);
    ctx.stroke();

    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.moveTo(5.3, -4.0);
    ctx.quadraticCurveTo(7.2, -3.7, 8.3, -4.5);
    ctx.stroke();

    // Organic curved side messy hair
    ctx.save();
    ctx.translate(0, hairBounce);
    ctx.fillStyle = HAIR;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-9.0, -10.5);
    ctx.quadraticCurveTo(-13.8, -13.2, -12.0, -16.5);
    ctx.quadraticCurveTo(-10.0, -21.0, -6.8, -24.5);
    ctx.quadraticCurveTo(-3.0, -22.2, -0.8, -21.5);
    ctx.quadraticCurveTo(2.0, -25.0, 4.2, -24.8);
    ctx.quadraticCurveTo(8.0, -20.5, 11.4, -15.8);
    ctx.quadraticCurveTo(7.2, -14.8, 4.8, -14.5);
    ctx.quadraticCurveTo(2.2, -11.8, 0.8, -9.8);
    ctx.quadraticCurveTo(-2.5, -5.0, -6.8, -2.8);
    ctx.quadraticCurveTo(-10.0, -5.8, -9.0, -10.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ear
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.arc(-1.8, -8.0, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair highlight
    ctx.strokeStyle = HAIR_LIGHT;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-5.2, -18.5);
    ctx.quadraticCurveTo(0, -20.8, 4.8, -17.8);
    ctx.stroke();
    ctx.restore();
    ctx.restore(); // end head

    const sideHeldWeaponKind: PlayerActionKind | null =
      params.selectedItemId === 'weapon_sword'
        ? 'SWORD'
        : params.selectedItemId === 'weapon_rifle'
        ? 'RIFLE'
        : null;

    // 4. Front articulated arm + gripped tool
    drawArticulatedArm(
      ctx,
      0,
      -15.5,
      !isActing && sideHeldWeaponKind === 'RIFLE' ? -0.95 : frontArmRot,
      isActing ? -0.14 : walkElbowF,
      false,
      1,
      isActing && actionKind !== 'HARVEST'
        ? { kind: actionKind, wristAngle: pose.wristAngle, pose, params }
        : sideHeldWeaponKind
        ? { kind: sideHeldWeaponKind, wristAngle: sideHeldWeaponKind === 'RIFLE' ? -0.55 : -0.25, pose, params }
        : undefined
    );

    if (pose.slashAlpha > 0.05) {
      ctx.save();
      ctx.globalAlpha = pose.slashAlpha * 0.72;
      ctx.strokeStyle =
        actionKind === 'SWORD' ? '#38BDF8' : actionKind === 'SCYTHE' ? '#F8FAFC' : '#FDE047';
      ctx.lineWidth = actionKind === 'SWORD' ? 4.2 : 3.5;
      ctx.beginPath();
      ctx.arc(8, -10, actionKind === 'SWORD' ? 30 : 26, -Math.PI * 0.48, Math.PI * 0.18);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore(); // end upper body rig
  }

  ctx.restore();

  if (params.isWading) {
    ctx.save();
    ctx.translate(playerScreenX, playerScreenY);
    const pulse = Math.sin(elapsedTime * 4.5) * 1.8;
    ctx.fillStyle = 'rgba(14, 165, 233, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, -5, 13, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(224, 242, 254, 0.78)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, -4, 15 + pulse, 5.5 + pulse * 0.25, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
