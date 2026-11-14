import { SEASONS } from '../data/cropsAndItems';
import {
  PlotState,
  SceneId,
  Season,
  WeatherType,
  WorldObject,
} from '../types/game';
import { drawLushTreeOrObject, drawSoilAndCrop } from './botanicalRenderer';
import { drawFarmerCharacter, PlayerActionKind } from './characterRenderer';
import {
  drawFarmhouseExterior,
  drawHouseDepthFurniture,
  drawHouseInteriorBase,
  drawHouseTileBase,
  drawLabBuildingExterior,
} from './houseRenderer';
import { SCENE_MAPS, TILE_SIZE, TileKind } from './maps';
import { CombatProjectile, drawBrownRobot, drawCombatProjectile, RobotDrawParams } from './robotRenderer';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: 'DUST' | 'WATER' | 'SPARKLE' | 'LEAF' | 'FIREFLY' | 'TEXT';
  text?: string;
}

export type FacingDir = 'DOWN' | 'UP' | 'LEFT' | 'RIGHT';

export interface RiverFish {
  id: string;
  kind: 'ikan_wader' | 'ikan_lele' | 'ikan_tomang';
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface RenderState {
  scene: SceneId;
  season: Season;
  weather: WeatherType;
  timeMinutes: number;
  playerX: number;
  playerY: number;
  facingDir: FacingDir;
  isMoving: boolean;
  walkCycle: number;
  actionKind: PlayerActionKind;
  actionProgress: number; // 0..1 when performing an action
  isBathing: boolean;
  isWading?: boolean;
  selectedItemId: string;
  hasSteelHoe: boolean;
  hasBigWateringCan: boolean;
  orchardUnlocked: boolean;
  rainBoots: boolean;
  plots: Record<string, PlotState>;
  worldObjects: WorldObject[];
  particles: Particle[];
  hoveredTile: { tx: number; ty: number } | null;
  moveTarget: { x: number; y: number } | null;
  cameraX: number;
  cameraY: number;
  shakeAmount: number;
  farmerSprite: HTMLCanvasElement | null;
  elapsedTime: number;
  robot?: RobotDrawParams | null;
  projectiles?: CombatProjectile[];
  riverFish?: RiverFish[];
}

function getSkyColorForTime(timeMinutes: number, weather: WeatherType): { overlay: string; nightAlpha: number; sunWarmth: number } {
  // 360 (06:00) -> 1440 (00:00)
  let nightAlpha = 0;
  let overlay = 'rgba(0,0,0,0)';
  let sunWarmth = 0;

  if (timeMinutes < 480) {
    // 06:00 - 08:00 sunrise
    const t = (timeMinutes - 360) / 120;
    sunWarmth = 1 - t;
    overlay = `rgba(255, 190, 110, ${(1 - t) * 0.16})`;
  } else if (timeMinutes < 930) {
    // 08:00 - 15:30 day
    overlay = 'rgba(0,0,0,0)';
  } else if (timeMinutes < 1110) {
    // 15:30 - 18:30 golden dusk (senja)
    const t = (timeMinutes - 930) / 180;
    sunWarmth = Math.sin(t * Math.PI);
    const duskAlpha = t < 0.6 ? (t / 0.6) * 0.24 : 0.24;
    const nightMix = t > 0.6 ? ((t - 0.6) / 0.4) * 0.35 : 0;
    nightAlpha = nightMix;
    overlay = `rgba(234, 88, 12, ${duskAlpha * (1 - nightMix)})`;
  } else {
    // 18:30 - 00:00 night
    const t = Math.min(1, (timeMinutes - 1110) / 150);
    nightAlpha = 0.35 + t * 0.35; // max 0.70 dark blue night
  }

  if (weather === 'HUJAN_DERAS') {
    nightAlpha = Math.max(nightAlpha, 0.24);
  } else if (weather === 'GERIMIS') {
    nightAlpha = Math.max(nightAlpha, 0.12);
  }

  return { overlay, nightAlpha, sunWarmth };
}

function getGrassPalette(season: Season) {
  switch (season) {
    case 'MARENG':
      return { base: '#5B9A42', dark: '#488132', accent: '#75B454' };
    case 'KEMARAU':
      return { base: '#8B9B42', dark: '#738231', accent: '#A8B153' };
    case 'LABUH':
      return { base: '#4E944F', dark: '#3D7B3E', accent: '#68B064' };
    case 'PENGHUJAN':
      return { base: '#3A8247', dark: '#2C6B38', accent: '#4FA15D' };
  }
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileKind,
  tx: number,
  ty: number,
  px: number,
  py: number,
  state: RenderState
) {
  const s = TILE_SIZE;
  const pal = getGrassPalette(state.season);
  const hash = (tx * 73856093) ^ (ty * 19349663);
  const v = Math.abs(hash % 100);

  switch (tile) {
    case 'GRASS': {
      ctx.fillStyle = v % 3 === 0 ? pal.accent : pal.base;
      ctx.fillRect(px, py, s, s);
      // Tiny grass tuft / flower
      if (v < 18) {
        ctx.fillStyle = pal.dark;
        ctx.fillRect(px + 10, py + 14, 3, 6);
        ctx.fillRect(px + 14, py + 12, 3, 8);
      } else if (v === 42) {
        ctx.fillStyle = state.season === 'KEMARAU' ? '#FDE047' : '#FFFBEB';
        ctx.beginPath();
        ctx.arc(px + 28, py + 24, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'DARK_GRASS': {
      ctx.fillStyle = pal.dark;
      ctx.fillRect(px, py, s, s);
      if (v < 28) {
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(px + 8, py + 18, 4, 7);
        ctx.fillRect(px + 14, py + 15, 3, 9);
      }
      break;
    }
    case 'DIRT_PATH': {
      ctx.fillStyle = '#C9A472';
      ctx.fillRect(px, py, s, s);
      if (v < 35) {
        ctx.fillStyle = '#B58D59';
        ctx.beginPath();
        ctx.arc(px + 12 + (v % 22), py + 14 + (v % 18), 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'STONE_ROAD': {
      ctx.fillStyle = '#A89F91';
      ctx.fillRect(px, py, s, s);
      // Warm mossy flagstone paving blocks leading to Kebun Atas
      ctx.fillStyle = v % 2 === 0 ? '#948B7E' : '#B5AC9D';
      ctx.beginPath();
      ctx.roundRect(px + 3, py + 4, 20, 18, 4);
      ctx.roundRect(px + 25, py + 6, 19, 17, 4);
      ctx.roundRect(px + 5, py + 25, 22, 18, 4);
      ctx.roundRect(px + 29, py + 26, 15, 17, 4);
      ctx.fill();
      if (v < 28) {
        ctx.fillStyle = '#4D7C0F';
        ctx.beginPath();
        ctx.arc(px + 23, py + 23, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'LAB_FLOOR': {
      // Cracked concrete & faded laboratory tile grid
      ctx.fillStyle = '#64748B';
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = v % 2 === 0 ? '#718096' : '#5B687A';
      ctx.fillRect(px + 2, py + 2, s - 4, s - 4);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
      // Overgrown moss cracks in abandoned lab
      if (v < 32) {
        ctx.fillStyle = '#3F6212';
        ctx.beginPath();
        ctx.ellipse(px + 12 + (v % 18), py + 14 + (v % 16), 5, 2.6, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'LAB_WALL': {
      ctx.fillStyle = '#334155';
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = '#475569';
      ctx.fillRect(px + 2, py + 3, s - 4, s - 10);
      // Rusted steel beam & overgrown jungle vine
      ctx.fillStyle = '#7C2D12';
      ctx.fillRect(px + 4, py + 6, s - 8, 5);
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.arc(px + 12 + (v % 18), py + 14, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 1, py + 1, s - 2, s - 2);
      break;
    }
    case 'LAB_CONSOLE': {
      ctx.fillStyle = '#5B687A';
      ctx.fillRect(px, py, s, s);
      // Broken glass bio-tank / research console
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(px + 6, py + 5, s - 12, s - 9, 4);
      ctx.fill();
      ctx.stroke();
      // Flickering amber/teal bio screen
      const flicker = Math.sin(state.elapsedTime * 5 + tx) > -0.4;
      ctx.fillStyle = flicker ? '#0D9488' : '#334155';
      ctx.fillRect(px + 11, py + 10, s - 22, 13);
      if (flicker) {
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(px + 14, py + 14, 8, 3);
      }
      ctx.fillStyle = '#4D7C0F';
      ctx.beginPath();
      ctx.arc(px + 13, py + 34, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'FARM_ZONE': {
      ctx.fillStyle = '#8D6E48';
      ctx.fillRect(px, py, s, s);
      ctx.strokeStyle = 'rgba(65, 45, 22, 0.18)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
      break;
    }
    case 'VOLCANIC_ZONE': {
      ctx.fillStyle = '#574135';
      ctx.fillRect(px, py, s, s);
      ctx.strokeStyle = 'rgba(255, 215, 130, 0.16)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
      break;
    }
    case 'WATER': {
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(px, py, s, s);
      const wave = Math.sin(state.elapsedTime * 2.5 + tx * 0.8 + ty * 0.5) * 4;
      ctx.fillStyle = 'rgba(224, 242, 254, 0.42)';
      ctx.fillRect(px + 8 + wave, py + 14, 14, 3);
      ctx.fillRect(px + 20 - wave, py + 32, 12, 3);
      break;
    }
    case 'RIVER_WATER': {
      // Clear flowing river water moving downstream (+Y) with submerged pebbles
      ctx.fillStyle = tx === 16 ? '#38BDF8' : '#0EA5E9';
      ctx.fillRect(px, py, s, s);
      if (tx === 16) {
        // Gentle shallow gravel edge on left side of river
        ctx.fillStyle = 'rgba(214, 194, 155, 0.42)';
        ctx.fillRect(px, py, 10, s);
      }
      if (v < 45) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
        ctx.beginPath();
        ctx.ellipse(px + 12 + (v % 22), py + 16 + (v % 18), 5.5, 3.8, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Animated downstream flowing current streaks
      const flowY1 = ((state.elapsedTime * 52 + tx * 17 + ty * 11) % s);
      const flowY2 = ((state.elapsedTime * 52 + tx * 29 + ty * 23 + 24) % s);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
      ctx.fillRect(px + 10 + (v % 10), py + flowY1, 3, 12);
      ctx.fillRect(px + 28 - (v % 8), py + flowY2, 2.5, 10);
      break;
    }
    case 'RIVER_BANK': {
      // Sandy gravel & river pebble bank
      ctx.fillStyle = v % 2 === 0 ? '#CBB48C' : '#BFA67B';
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = '#9E8865';
      if (v < 65) {
        ctx.beginPath();
        ctx.ellipse(px + 11 + (v % 20), py + 13 + (v % 18), 4.2, 2.8, 0.2, 0, Math.PI * 2);
        ctx.ellipse(px + 30 - (v % 12), py + 32 - (v % 12), 3.4, 2.3, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (tx === 15) {
        // Wet shoreline edge meeting the river
        ctx.fillStyle = '#9D8866';
        ctx.fillRect(px + s - 8, py, 8, s);
      }
      break;
    }
    case 'WOOD_BRIDGE': {
      // Flowing stream underneath + sturdy wooden planks across
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(px, py + 2, s, s - 4);
      ctx.fillStyle = '#B45309';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(px + i * 12 + 1, py + 4, 10, s - 8);
      }
      ctx.fillStyle = '#451A03';
      ctx.fillRect(px, py + 2, s, 4);
      ctx.fillRect(px, py + s - 6, s, 4);
      break;
    }
    case 'FENCE': {
      ctx.fillStyle = pal.dark;
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = '#6D4C2F';
      ctx.fillRect(px + 4, py + 12, s - 8, 8);
      ctx.fillRect(px + 4, py + 28, s - 8, 8);
      ctx.fillStyle = '#8B5E3C';
      ctx.fillRect(px + 8, py + 6, 10, s - 10);
      ctx.fillRect(px + s - 18, py + 6, 10, s - 10);
      break;
    }
    case 'GATE_LOCKED': {
      ctx.fillStyle = '#A89F91';
      ctx.fillRect(px, py, s, s);
      break;
    }
    case 'SIGN': {
      ctx.fillStyle = pal.base;
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(px + 21, py + 24, 6, 18);
      ctx.fillStyle = '#B45309';
      ctx.fillRect(px + 8, py + 8, 32, 20);
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(px + 12, py + 13, 24, 3);
      ctx.fillRect(px + 12, py + 19, 18, 3);
      break;
    }
    case 'WELL': {
      ctx.fillStyle = '#C9A472';
      ctx.fillRect(px, py, s, s);
      // Stone well rim
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.arc(px + s / 2, py + s / 2 + 4, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(px + s / 2, py + s / 2 + 4, 12, 0, Math.PI * 2);
      ctx.fill();
      // Small wooden roof posts
      ctx.fillStyle = '#78350F';
      ctx.fillRect(px + 8, py + 4, 5, 24);
      ctx.fillRect(px + s - 13, py + 4, 5, 24);
      ctx.fillStyle = '#B45309';
      ctx.fillRect(px + 4, py + 2, s - 8, 8);
      break;
    }
    case 'HOUSE_ROOF':
    case 'HOUSE_WALL': {
      ctx.fillStyle = pal.base;
      ctx.fillRect(px, py, s, s);
      break;
    }
    case 'DOOR': {
      if (state.scene === 'HOUSE') {
        drawHouseTileBase(ctx, tile, tx, ty, px, py);
      } else {
        ctx.fillStyle = '#C9A472';
        ctx.fillRect(px, py, s, s);
      }
      break;
    }
    case 'WALL':
    case 'BATH_FLOOR':
    case 'WOOD_FLOOR_BED':
    case 'WOOD_FLOOR_MAIN':
    case 'WOOD_FLOOR_WORK':
    case 'RUG':
    case 'FURNITURE_BED':
    case 'FURNITURE_PC':
    case 'FURNITURE_TV':
    case 'FURNITURE_SOFA':
    case 'FURNITURE_KITCHEN':
    case 'FURNITURE_SHELF':
    case 'FURNITURE_BATH_POOL':
    case 'FURNITURE_BATH_VANITY': {
      drawHouseTileBase(ctx, tile, tx, ty, px, py);
      break;
    }
  }
}

export function renderGameWorld(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: RenderState
) {
  const map = SCENE_MAPS[state.scene];
  const worldW = map.width * TILE_SIZE;
  const worldH = map.height * TILE_SIZE;

  ctx.save();
  ctx.fillStyle = state.scene === 'HOUSE' ? '#1C140F' : '#142416';
  ctx.fillRect(0, 0, width, height);

  // Compute camera transform
  const offsetX = Math.round(width / 2 - state.cameraX + (Math.random() - 0.5) * state.shakeAmount);
  const offsetY = Math.round(height / 2 - state.cameraY + (Math.random() - 0.5) * state.shakeAmount);
  ctx.translate(offsetX, offsetY);

  // 1. Tiles
  const startTx = Math.max(0, Math.floor((state.cameraX - width / 2) / TILE_SIZE) - 1);
  const endTx = Math.min(map.width - 1, Math.ceil((state.cameraX + width / 2) / TILE_SIZE) + 1);
  const startTy = Math.max(0, Math.floor((state.cameraY - height / 2) / TILE_SIZE) - 1);
  const endTy = Math.min(map.height - 1, Math.ceil((state.cameraY + height / 2) / TILE_SIZE) + 1);

  for (let ty = startTy; ty <= endTy; ty++) {
    for (let tx = startTx; tx <= endTx; tx++) {
      drawTile(ctx, map.tiles[ty][tx], tx, ty, tx * TILE_SIZE, ty * TILE_SIZE, state);
    }
  }

  // Cohesive Farmhouse Exterior (FARM), Unified Interior (HOUSE), & Research Lab Building (LAB)
  if (state.scene === 'FARM') {
    drawFarmhouseExterior(ctx, state);
  } else if (state.scene === 'HOUSE') {
    drawHouseInteriorBase(ctx, state);
  } else if (state.scene === 'LAB') {
    drawLabBuildingExterior(ctx, state);
  }

  // 2. Plots (Farm / Orchard)
  if (state.scene === 'FARM' || state.scene === 'ORCHARD') {
    for (const plot of Object.values(state.plots)) {
      if (plot.scene !== state.scene) continue;
      if (plot.tx < startTx || plot.tx > endTx || plot.ty < startTy || plot.ty > endTy) continue;
      drawSoilAndCrop(ctx, plot, plot.tx * TILE_SIZE, plot.ty * TILE_SIZE, state.elapsedTime);
    }
  }

  // 3. Hovered / Target Tile Highlight
  if (state.hoveredTile && state.scene !== 'HOUSE') {
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.85)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      state.hoveredTile.tx * TILE_SIZE + 2,
      state.hoveredTile.ty * TILE_SIZE + 2,
      TILE_SIZE - 4,
      TILE_SIZE - 4
    );
  }

  // 3b. Click-to-move destination marker (Stardew-style green/gold target ring)
  if (state.moveTarget) {
    const mx = state.moveTarget.x * TILE_SIZE;
    const my = state.moveTarget.y * TILE_SIZE;
    const pulse = 1 + Math.sin(state.elapsedTime * 8) * 0.14;
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(mx, my, 12 * pulse, 7 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
    ctx.fill();
    ctx.restore();
  }

  // 3c. Animated River Fish swimming downstream in Pinggiran Kali
  if (state.scene === 'RIVER' && state.riverFish && state.riverFish.length > 0) {
    for (const fish of state.riverFish) {
      const fx = fish.x * TILE_SIZE;
      const fy = fish.y * TILE_SIZE;
      const wag = Math.sin(state.elapsedTime * 9 + fish.y * 2) * 3.5;
      const nearPlayer = Math.hypot(fish.x - state.playerX, fish.y - state.playerY) <= 2.7;

      ctx.save();
      ctx.translate(fx, fy);

      // Water surface ripple around fish
      ctx.strokeStyle = nearPlayer ? 'rgba(253, 224, 71, 0.85)' : 'rgba(224, 242, 254, 0.65)';
      ctx.lineWidth = nearPlayer ? 2.0 : 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, nearPlayer ? 22 : 16, nearPlayer ? 15 : 11, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Fish shadow underneath
      ctx.fillStyle = 'rgba(8, 47, 73, 0.32)';
      ctx.beginPath();
      ctx.ellipse(2, 4, fish.kind === 'ikan_tomang' ? 14 : 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rotate slightly toward downstream swim direction (+Y)
      ctx.rotate(Math.PI / 2 + wag * 0.04);

      if (fish.kind === 'ikan_wader') {
        // Wader: slender silvery river minnow
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-14, -4 + wag * 0.5);
        ctx.lineTo(-14, 4 + wag * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#E2E8F0';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 9.5, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(5.5, -1, 1.1, 0, Math.PI * 2);
        ctx.fill();
      } else if (fish.kind === 'ikan_lele') {
        // Lele: dark slate catfish with barbels/whiskers
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-17, -5 + wag * 0.6);
        ctx.lineTo(-17, 5 + wag * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12.5, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(10, -2);
        ctx.lineTo(15, -6);
        ctx.moveTo(10, 2);
        ctx.lineTo(15, 6);
        ctx.stroke();

        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(7.5, -1.6, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Tomang: large striped teal-gold predator fish
        ctx.fillStyle = '#0F766E';
        ctx.beginPath();
        ctx.moveTo(-13, 0);
        ctx.lineTo(-22, -7 + wag * 0.65);
        ctx.lineTo(-22, 7 + wag * 0.65);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#0D9488';
        ctx.strokeStyle = '#042F2E';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 15.5, 6.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-5, -4);
        ctx.lineTo(-4, 4);
        ctx.moveTo(1, -4.5);
        ctx.lineTo(2, 4.5);
        ctx.moveTo(7, -3.5);
        ctx.lineTo(8, 3.5);
        ctx.stroke();

        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(10.5, -2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (nearPlayer) {
        ctx.save();
        ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        const label =
          fish.kind === 'ikan_tomang'
            ? 'Tomang (Klik/Spasi)'
            : fish.kind === 'ikan_lele'
            ? 'Lele (Klik/Spasi)'
            : 'Wader (Klik/Spasi)';
        ctx.fillStyle = '#0F172A';
        ctx.fillText(label, fx + 1, fy - 19);
        ctx.fillStyle = fish.kind === 'ikan_tomang' ? '#FDE047' : '#E0F2FE';
        ctx.fillText(label, fx, fy - 20);
        ctx.restore();
      }
    }
  }

  // 4. Depth-sorted World Objects, Interior Furniture & Player
  const sceneObjs = state.worldObjects.filter((o) => o.scene === state.scene);
  const playerScreenX = state.playerX * TILE_SIZE;
  const playerScreenY = state.playerY * TILE_SIZE;

  const behindObjs = sceneObjs.filter((o) => (o.ty + 0.6) * TILE_SIZE <= playerScreenY);
  const frontObjs = sceneObjs.filter((o) => (o.ty + 0.6) * TILE_SIZE > playerScreenY);

  for (const o of behindObjs) drawLushTreeOrObject(ctx, o, state.elapsedTime);
  if (state.scene === 'HOUSE') {
    drawHouseDepthFurniture(ctx, state, 'BEHIND_PLAYER');
  }

  const robot = state.robot;
  const robotBehind = robot && robot.y * TILE_SIZE <= playerScreenY;
  if (robot && robotBehind) {
    drawBrownRobot(ctx, robot);
  }

  drawFarmerCharacter(ctx, {
    x: playerScreenX,
    y: playerScreenY,
    facingDir: state.facingDir,
    walkCycle: state.walkCycle,
    isMoving: state.isMoving,
    actionKind: state.actionKind,
    actionProgress: state.actionProgress,
    isBathing: state.isBathing,
    isWading: state.isWading,
    selectedItemId: state.selectedItemId,
    hasSteelHoe: state.hasSteelHoe,
    hasBigWateringCan: state.hasBigWateringCan,
    elapsedTime: state.elapsedTime,
  });

  if (robot && !robotBehind) {
    drawBrownRobot(ctx, robot);
  }

  if (state.scene === 'HOUSE') {
    drawHouseDepthFurniture(ctx, state, 'IN_FRONT_OF_PLAYER');
  }
  for (const o of frontObjs) drawLushTreeOrObject(ctx, o, state.elapsedTime);

  // 4b. Combat Energy Projectiles
  if (state.projectiles) {
    for (const proj of state.projectiles) {
      drawCombatProjectile(ctx, proj);
    }
  }

  // 5. Particles
  for (const p of state.particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.kind === 'TEXT' && p.text) {
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(p.text, p.x + 1, p.y + 1);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
    } else if (p.kind === 'FIREFLY') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 6. Outdoor Weather & Day/Night Lighting
  if (state.scene !== 'HOUSE') {
    const { overlay, nightAlpha } = getSkyColorForTime(state.timeMinutes, state.weather);

    // Rain streaks in world space
    if (state.weather === 'GERIMIS' || state.weather === 'HUJAN_DERAS') {
      const count = state.weather === 'HUJAN_DERAS' ? 140 : 55;
      ctx.strokeStyle = state.weather === 'HUJAN_DERAS' ? 'rgba(186, 230, 253, 0.55)' : 'rgba(224, 242, 254, 0.42)';
      ctx.lineWidth = state.weather === 'HUJAN_DERAS' ? 1.8 : 1.2;
      const viewLeft = state.cameraX - width / 2;
      const viewTop = state.cameraY - height / 2;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const rx = viewLeft + ((i * 97 + state.elapsedTime * 340) % (width + 120)) - 60;
        const ry = viewTop + ((i * 59 + state.elapsedTime * 780) % (height + 80)) - 40;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 7, ry + (state.weather === 'HUJAN_DERAS' ? 22 : 13));
      }
      ctx.stroke();
    }

    // Season tint
    ctx.fillStyle = SEASONS[state.season].tintHex;
    ctx.fillRect(0, 0, worldW, worldH);

    // Dusk/Sunrise tint
    if (overlay !== 'rgba(0,0,0,0)') {
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, worldW, worldH);
    }

    // Night darkness + warm player lantern halo
    if (nightAlpha > 0.01) {
      ctx.fillStyle = `rgba(9, 17, 34, ${nightAlpha})`;
      ctx.fillRect(0, 0, worldW, worldH);

      // Soft warm glow around player at night
      const grad = ctx.createRadialGradient(
        playerScreenX,
        playerScreenY - 24,
        14,
        playerScreenX,
        playerScreenY - 24,
        150
      );
      grad.addColorStop(0, 'rgba(253, 224, 71, 0.24)');
      grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(playerScreenX, playerScreenY - 24, 150, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
