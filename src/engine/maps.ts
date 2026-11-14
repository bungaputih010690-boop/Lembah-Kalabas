import { SceneId, WorldObject } from '../types/game';

export const TILE_SIZE = 48;

export type TileKind =
  | 'GRASS'
  | 'DARK_GRASS'
  | 'DIRT_PATH'
  | 'STONE_ROAD'
  | 'FARM_ZONE'
  | 'VOLCANIC_ZONE'
  | 'WATER'
  | 'RIVER_WATER'
  | 'RIVER_BANK'
  | 'WOOD_BRIDGE'
  | 'FENCE'
  | 'WALL'
  | 'LAB_FLOOR'
  | 'LAB_WALL'
  | 'LAB_CONSOLE'
  | 'HOUSE_ROOF'
  | 'HOUSE_WALL'
  | 'DOOR'
  | 'WELL'
  | 'GATE_LOCKED'
  | 'WOOD_FLOOR_BED'
  | 'WOOD_FLOOR_MAIN'
  | 'WOOD_FLOOR_WORK'
  | 'BATH_FLOOR'
  | 'RUG'
  | 'FURNITURE_BED'
  | 'FURNITURE_PC'
  | 'FURNITURE_TV'
  | 'FURNITURE_SOFA'
  | 'FURNITURE_KITCHEN'
  | 'FURNITURE_SHELF'
  | 'FURNITURE_BATH_POOL'
  | 'FURNITURE_BATH_VANITY'
  | 'SIGN';

export interface ScenePortal {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  targetScene: SceneId;
  spawnX: number;
  spawnY: number;
  requiresOrchardDeed?: boolean;
  label: string;
}

export interface InteractZone {
  id:
    | 'DOOR_IN'
    | 'DOOR_OUT'
    | 'PC'
    | 'BED'
    | 'TV'
    | 'WELL'
    | 'STREAM'
    | 'GATE_SIGN'
    | 'BATH'
    | 'LAB_SIGN'
    | 'LAB_DOOR'
    | 'LAB_ROAD_SIGN'
    | 'RIVER_SIGN'
    | 'RIVER_BANK_SIGN';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  prompt: string;
}

export interface SceneMap {
  id: SceneId;
  name: string;
  width: number;
  height: number;
  tiles: TileKind[][];
  portals: ScenePortal[];
  interactZones: InteractZone[];
}

function createGrid(w: number, h: number, fill: TileKind): TileKind[][] {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
}

function fillRect(grid: TileKind[][], x1: number, y1: number, x2: number, y2: number, kind: TileKind) {
  for (let y = y1; y <= y2; y++) {
    if (y < 0 || y >= grid.length) continue;
    for (let x = x1; x <= x2; x++) {
      if (x < 0 || x >= grid[0].length) continue;
      grid[y][x] = kind;
    }
  }
}

export function isTileSolid(tile: TileKind, _orchardUnlocked: boolean): boolean {
  switch (tile) {
    case 'WATER':
    case 'FENCE':
    case 'WALL':
    case 'LAB_WALL':
    case 'LAB_CONSOLE':
    case 'HOUSE_ROOF':
    case 'HOUSE_WALL':
    case 'WELL':
    case 'FURNITURE_BED':
    case 'FURNITURE_PC':
    case 'FURNITURE_TV':
    case 'FURNITURE_SOFA':
    case 'FURNITURE_KITCHEN':
    case 'FURNITURE_SHELF':
    case 'FURNITURE_BATH_POOL':
    case 'FURNITURE_BATH_VANITY':
    case 'SIGN':
      return true;
    case 'GATE_LOCKED':
      return false;
    default:
      return false;
  }
}

export function buildFarmMap(): SceneMap {
  const w = 28;
  const h = 20;
  const g = createGrid(w, h, 'GRASS');

  // Border hedges/fences leaving North road & East forest path open
  fillRect(g, 0, 0, w - 1, 0, 'FENCE');
  fillRect(g, 0, h - 1, w - 1, h - 1, 'FENCE');
  fillRect(g, 0, 0, 0, h - 1, 'FENCE');
  fillRect(g, w - 1, 0, w - 1, h - 1, 'FENCE');

  // Open Stone Road to Kebun Atas (x: 14..15, y: 0..7)
  fillRect(g, 14, 0, 15, 7, 'STONE_ROAD');
  g[2][13] = 'SIGN';

  // East Path to Forest (y: 9..10)
  fillRect(g, w - 1, 9, w - 1, 10, 'DIRT_PATH');
  fillRect(g, 19, 9, w - 1, 10, 'DIRT_PATH');
  g[8][25] = 'SIGN';

  // House footprint (x: 3..8, y: 2..5)
  fillRect(g, 3, 2, 8, 3, 'HOUSE_ROOF');
  fillRect(g, 3, 4, 8, 5, 'HOUSE_WALL');
  g[5][5] = 'DOOR'; // front door
  // Path from door connecting to Kebun Atas road
  fillRect(g, 5, 6, 5, 7, 'DIRT_PATH');
  fillRect(g, 5, 7, 13, 7, 'DIRT_PATH');

  // Water Well (Sumur)
  g[4][10] = 'WELL';
  fillRect(g, 9, 5, 11, 6, 'DIRT_PATH');

  // Main Farmable Soil Area (x: 5..18, y: 8..16) -> 14 x 9 = 126 plots
  fillRect(g, 5, 8, 18, 16, 'FARM_ZONE');

  // Decorative perimeter dark grass patches
  fillRect(g, 1, 1, 2, 18, 'DARK_GRASS');
  fillRect(g, 20, 1, 26, 7, 'DARK_GRASS');
  fillRect(g, 20, 12, 26, 18, 'DARK_GRASS');

  return {
    id: 'FARM',
    name: 'Kebun Utama',
    width: w,
    height: h,
    tiles: g,
    portals: [
      {
        x1: 4.8,
        y1: 5.0,
        x2: 6.2,
        y2: 5.85,
        targetScene: 'HOUSE',
        spawnX: 12.0,
        spawnY: 9.7,
        label: 'Masuk Rumah',
      },
      {
        x1: 27.2,
        y1: 8.6,
        x2: 28.0,
        y2: 11.4,
        targetScene: 'FOREST',
        spawnX: 1.5,
        spawnY: 9.5,
        label: 'Menuju Hutan',
      },
      {
        x1: 13.6,
        y1: 0.0,
        x2: 16.4,
        y2: 0.9,
        targetScene: 'ORCHARD',
        spawnX: 14.0,
        spawnY: 17.6,
        label: 'Menuju Kebun Atas (Hutan Rimba & Bekas Lab)',
      },
    ],
    interactZones: [
      { id: 'DOOR_IN', x1: 4.3, y1: 5.0, x2: 6.7, y2: 6.8, prompt: 'Masuk ke Dalam Rumah' },
      { id: 'WELL', x1: 9.0, y1: 3.2, x2: 11.8, y2: 5.9, prompt: 'Isi Ulang Ember Siram di Sumur' },
      { id: 'GATE_SIGN', x1: 12.2, y1: 1.1, x2: 16.5, y2: 3.4, prompt: 'Jalan ke Kebun Atas · Hutan Rimba, Pohon Kalabas & Bekas Lab' },
    ],
  };
}

export function buildHouseMap(): SceneMap {
  // 3 connected rooms:
  // Room 1 (x: 1..7) = Kamar Mandi (Kolam Berendam)
  // Room 2 (x: 9..15) = Ruang Tengah & Dapur
  // Room 3 (x: 17..22) = Kamar Tidur & PC (PC tepat di bawah tempat tidur)
  const w = 24;
  const h = 12;
  const g = createGrid(w, h, 'WALL');

  // Room 1: Kamar Mandi (ruangan paling kiri)
  fillRect(g, 1, 2, 7, 10, 'BATH_FLOOR');
  fillRect(g, 2, 4, 4, 5, 'FURNITURE_BATH_POOL');
  fillRect(g, 5, 2, 6, 2, 'FURNITURE_BATH_VANITY');
  fillRect(g, 2, 6, 4, 6, 'RUG');

  // Divider 1 with wide doorway (y: 5..7)
  fillRect(g, 8, 5, 8, 7, 'WOOD_FLOOR_MAIN');

  // Room 2: Ruang Tengah & Dapur
  fillRect(g, 9, 2, 15, 10, 'WOOD_FLOOR_MAIN');
  fillRect(g, 9, 2, 10, 2, 'FURNITURE_KITCHEN');
  g[2][12] = 'FURNITURE_TV';
  fillRect(g, 11, 4, 13, 4, 'FURNITURE_SOFA');
  fillRect(g, 10, 6, 14, 8, 'RUG');
  // Exit door at bottom
  g[11][11] = 'DOOR';
  g[11][12] = 'DOOR';

  // Divider 2 with wide doorway (y: 5..7)
  fillRect(g, 16, 5, 16, 7, 'WOOD_FLOOR_MAIN');

  // Room 3: Kamar Tidur & PC (PC satu ruangan dengan kamar tidur, tepat di bawah tempat tidur)
  fillRect(g, 17, 2, 22, 10, 'WOOD_FLOOR_BED');
  fillRect(g, 18, 3, 19, 4, 'FURNITURE_BED');
  fillRect(g, 21, 2, 22, 2, 'FURNITURE_SHELF');
  fillRect(g, 18, 5, 20, 6, 'RUG');
  fillRect(g, 18, 8, 21, 9, 'FURNITURE_PC');

  return {
    id: 'HOUSE',
    name: 'Rumah (3 Ruangan)',
    width: w,
    height: h,
    tiles: g,
    portals: [
      {
        x1: 10.7,
        y1: 10.65,
        x2: 13.3,
        y2: 12.0,
        targetScene: 'FARM',
        spawnX: 5.5,
        spawnY: 6.45,
        label: 'Keluar ke Kebun',
      },
    ],
    interactZones: [
      { id: 'BATH', x1: 1.2, y1: 3.2, x2: 5.7, y2: 7.0, prompt: 'Berendam di Kolam (1 Jam · +20 Health, +10 Mood)' },
      { id: 'TV', x1: 11.2, y1: 2.0, x2: 13.8, y2: 3.9, prompt: 'Tonton Prakiraan Cuaca BMKG' },
      { id: 'BED', x1: 17.1, y1: 2.3, x2: 20.9, y2: 5.7, prompt: 'Tidur (Simpan & Lanjut 06:00)' },
      { id: 'PC', x1: 17.0, y1: 6.7, x2: 22.3, y2: 10.6, prompt: 'Buka PC TaniNet (Belanja & Jual Online)' },
      { id: 'DOOR_OUT', x1: 10.6, y1: 9.8, x2: 13.4, y2: 11.5, prompt: 'Keluar ke Halaman Kebun' },
    ],
  };
}

export function buildForestMap(): SceneMap {
  const w = 26;
  const h = 18;
  const g = createGrid(w, h, 'DARK_GRASS');

  fillRect(g, 0, 0, w - 1, 0, 'FENCE');
  fillRect(g, 0, h - 1, w - 1, h - 1, 'FENCE');
  fillRect(g, 0, 0, 0, h - 1, 'FENCE');
  fillRect(g, w - 1, 0, w - 1, h - 1, 'FENCE');

  // West path back to Farm & winding forest trail
  fillRect(g, 0, 8, 0, 10, 'DIRT_PATH');
  fillRect(g, 0, 8, 20, 10, 'DIRT_PATH');
  fillRect(g, 10, 4, 13, 14, 'DIRT_PATH');

  // Forest Stream on the right, crossed by a wooden bridge leading east to Pinggiran Kali
  fillRect(g, 21, 2, 23, 15, 'WATER');
  fillRect(g, 21, 8, 23, 10, 'WOOD_BRIDGE');
  fillRect(g, 24, 8, w - 1, 10, 'DIRT_PATH');
  g[7][2] = 'SIGN';
  g[7][24] = 'SIGN';

  return {
    id: 'FOREST',
    name: 'Hutan Tropis',
    width: w,
    height: h,
    tiles: g,
    portals: [
      {
        x1: 0.0,
        y1: 7.7,
        x2: 0.85,
        y2: 11.3,
        targetScene: 'FARM',
        spawnX: 26.2,
        spawnY: 9.5,
        label: 'Kembali ke Kebun',
      },
      {
        x1: 25.15,
        y1: 7.7,
        x2: 26.0,
        y2: 11.3,
        targetScene: 'RIVER',
        spawnX: 1.5,
        spawnY: 9.5,
        label: 'Memasuki Pinggiran Kali',
      },
    ],
    interactZones: [
      { id: 'STREAM', x1: 19.6, y1: 2.0, x2: 21.5, y2: 7.4, prompt: 'Isi Ulang Ember Siram di Sungai' },
      { id: 'RIVER_SIGN', x1: 23.0, y1: 6.4, x2: 25.4, y2: 8.4, prompt: 'Timur: Pinggiran Kali (Batu Alam & Tangkap Ikan)' },
    ],
  };
}

export function buildRiverMap(): SceneMap {
  // Pinggiran Kali: Tepi berbatu dengan sangat banyak batu & sungai berarus deras yang bisa dimasuki untuk menangkap ikan (Wader, Lele, Tomang)
  const w = 28;
  const h = 20;
  const g = createGrid(w, h, 'GRASS');

  fillRect(g, 0, 0, w - 1, 0, 'FENCE');
  fillRect(g, 0, h - 1, w - 1, h - 1, 'FENCE');
  fillRect(g, 0, 0, 0, h - 1, 'FENCE');
  fillRect(g, w - 1, 0, w - 1, h - 1, 'FENCE');

  // West forest edge & wide rocky sandy riverbank
  fillRect(g, 1, 1, 5, 18, 'DARK_GRASS');
  fillRect(g, 6, 1, 15, 18, 'RIVER_BANK');

  // Dirt trail from west portal straight to the flowing river entry
  fillRect(g, 0, 8, 15, 10, 'DIRT_PATH');
  g[7][14] = 'SIGN';

  // Walkable flowing river (RIVER_WATER) & deep eastern boundary (WATER)
  fillRect(g, 16, 1, 24, 18, 'RIVER_WATER');
  fillRect(g, 25, 1, 26, 18, 'WATER');

  return {
    id: 'RIVER',
    name: 'Pinggiran Kali',
    width: w,
    height: h,
    tiles: g,
    portals: [
      {
        x1: 0.0,
        y1: 7.7,
        x2: 0.9,
        y2: 11.3,
        targetScene: 'FOREST',
        spawnX: 24.3,
        spawnY: 9.5,
        label: 'Kembali ke Hutan Tropis',
      },
    ],
    interactZones: [
      {
        id: 'RIVER_BANK_SIGN',
        x1: 12.8,
        y1: 6.2,
        x2: 15.8,
        y2: 8.6,
        prompt: 'Masuk ke Sungai & Tunggu 5 Detik untuk Ikan (Wader · Lele · Tomang)',
      },
    ],
  };
}

export function buildOrchardMap(): SceneMap {
  // Kebun Atas: Lahan Vulkanik Subur & Jalan Menuju Hutan Kalabas + Lab Penelitian di Utara
  const w = 28;
  const h = 20;
  const g = createGrid(w, h, 'GRASS');

  fillRect(g, 0, 0, w - 1, 0, 'FENCE');
  fillRect(g, 0, h - 1, w - 1, h - 1, 'FENCE');
  fillRect(g, 0, 0, 0, h - 1, 'FENCE');
  fillRect(g, w - 1, 0, w - 1, h - 1, 'FENCE');

  // Jungle border frame at top & sides
  fillRect(g, 1, 1, w - 2, 4, 'DARK_GRASS');
  fillRect(g, 1, 5, 2, 17, 'DARK_GRASS');
  fillRect(g, 25, 5, 26, 17, 'DARK_GRASS');

  // Open Stone Road running straight North from Kebun Utama to Hutan Kalabas & Lab
  fillRect(g, 13, 0, 14, 19, 'STONE_ROAD');
  g[2][12] = 'SIGN';

  // Rich volcanic farmable clearings flanking the stone road
  fillRect(g, 4, 5, 11, 16, 'VOLCANIC_ZONE');
  fillRect(g, 16, 5, 23, 16, 'VOLCANIC_ZONE');

  // Jungle spring pond on left
  fillRect(g, 1, 11, 2, 13, 'WATER');

  return {
    id: 'ORCHARD',
    name: 'Kebun Atas Nusantara',
    width: w,
    height: h,
    tiles: g,
    portals: [
      {
        x1: 12.5,
        y1: 18.8,
        x2: 15.5,
        y2: 20.0,
        targetScene: 'FARM',
        spawnX: 14.5,
        spawnY: 1.5,
        label: 'Turun ke Kebun Utama',
      },
      {
        x1: 12.5,
        y1: 0.0,
        x2: 15.5,
        y2: 0.9,
        targetScene: 'LAB',
        spawnX: 14.0,
        spawnY: 20.0,
        label: 'Masuk Hutan Kalabas & Lab Penelitian',
      },
    ],
    interactZones: [
      { id: 'STREAM', x1: 1.0, y1: 10.2, x2: 3.6, y2: 14.2, prompt: 'Isi Ulang Ember Siram di Mata Air Rimba' },
      { id: 'LAB_ROAD_SIGN', x1: 11.1, y1: 1.4, x2: 13.4, y2: 3.6, prompt: 'Utara: Hutan Pohon Kalabas Tua & Lab Penelitian' },
    ],
  };
}

export function buildLabMap(): SceneMap {
  // Scene khusus sebelah utara Kebun Atas: Lab Penelitian (tidak dapat dimasuki) & Robot Mecha Coklat dikelilingi 40 pohon kalabas tua yang rimbun
  const w = 28;
  const h = 22;
  const g = createGrid(w, h, 'DARK_GRASS');

  fillRect(g, 0, 0, w - 1, 0, 'FENCE');
  fillRect(g, 0, h - 1, w - 1, h - 1, 'FENCE');
  fillRect(g, 0, 0, 0, h - 1, 'FENCE');
  fillRect(g, w - 1, 0, w - 1, h - 1, 'FENCE');

  // Stone Courtyard & Road from Kebun Atas (south entrance at x: 13..14, y: 21)
  fillRect(g, 13, 11, 14, 21, 'STONE_ROAD');
  fillRect(g, 10, 7, 17, 11, 'STONE_ROAD');
  fillRect(g, 11, 7, 16, 9, 'LAB_FLOOR');
  g[11][11] = 'SIGN';

  // Research Lab Building shaped like Player Farmhouse (6x4 footprint, completely solid & un-enterable!)
  fillRect(g, 11, 3, 16, 4, 'HOUSE_ROOF');
  fillRect(g, 11, 5, 16, 6, 'HOUSE_WALL');

  return {
    id: 'LAB',
    name: 'Hutan Kalabas & Lab Penelitian',
    width: w,
    height: h,
    tiles: g,
    portals: [
      {
        x1: 12.5,
        y1: 21.0,
        x2: 15.5,
        y2: 22.0,
        targetScene: 'ORCHARD',
        spawnX: 14.0,
        spawnY: 1.5,
        label: 'Kembali ke Kebun Atas',
      },
    ],
    interactZones: [
      { id: 'LAB_DOOR', x1: 12.4, y1: 6.4, x2: 15.6, y2: 7.7, prompt: 'Pintu Lab Terkunci (Tidak Dapat Dimasuki)' },
      { id: 'LAB_SIGN', x1: 10.2, y1: 10.4, x2: 12.4, y2: 12.6, prompt: 'Lab Penelitian · Robot Mecha Coklat & Hutan Kalabas Tua' },
    ],
  };
}

export const SCENE_MAPS: Record<SceneId, SceneMap> = {
  FARM: buildFarmMap(),
  HOUSE: buildHouseMap(),
  FOREST: buildForestMap(),
  ORCHARD: buildOrchardMap(),
  LAB: buildLabMap(),
  RIVER: buildRiverMap(),
};

export const LAB_KALABAS_DROP_SPOTS: [number, number][] = [
  [4, 4],
  [6, 6],
  [9, 6],
  [4, 9],
  [7, 12],
  [9, 15],
  [21, 4],
  [18, 6],
  [23, 9],
  [21, 12],
  [18, 15],
  [11, 14],
];

export function createKebunAtasObjects(startSeq = 500): WorldObject[] {
  const objs: WorldObject[] = [];
  let seq = startSeq;

  // Elder Kalabas & Rimba trees bordering northern exit of Kebun Atas
  const borderKalabas: [number, number][] = [
    [3, 2],
    [8, 2],
    [18, 2],
    [24, 2],
  ];
  for (const [tx, ty] of borderKalabas) {
    objs.push({
      id: `obj_${seq++}`,
      scene: 'ORCHARD',
      tx,
      ty,
      kind: 'FRUIT_TREE',
      itemId: 'buah_kalabas',
      hp: 99,
      maxHp: 99,
      harvestReady: true,
      regrowTimer: 0,
      label: 'Pohon Kalabas Tua',
    });
  }

  const rimbaTrees: [number, number][] = [
    [2, 7],
    [25, 7],
    [2, 16],
    [25, 16],
  ];
  for (const [tx, ty] of rimbaTrees) {
    objs.push({
      id: `obj_${seq++}`,
      scene: 'ORCHARD',
      tx,
      ty,
      kind: 'TREE',
      hp: 4,
      maxHp: 4,
      label: 'Pohon Rimba Lebat',
    });
  }

  // Perennial Mango, Durian & Coconut trees on Kebun Atas
  const orchardTrees: [number, number, string, string][] = [
    [5, 3, 'buah_mangga', 'Pohon Mangga Harum Manis'],
    [10, 3, 'buah_durian', 'Pohon Durian Nusantara'],
    [17, 3, 'buah_durian', 'Pohon Durian Nusantara'],
    [22, 3, 'buah_mangga', 'Pohon Mangga Harum Manis'],
    [25, 11, 'kelapa_gading', 'Pohon Kelapa Gading'],
    [25, 14, 'kelapa_gading', 'Pohon Kelapa Gading'],
  ];
  for (const [tx, ty, itemId, label] of orchardTrees) {
    objs.push({
      id: `obj_${seq++}`,
      scene: 'ORCHARD',
      tx,
      ty,
      kind: 'FRUIT_TREE',
      itemId,
      hp: 99,
      maxHp: 99,
      harvestReady: true,
      regrowTimer: 0,
      label,
    });
  }

  return objs;
}

export function spawnFallenKalabasDrops(existingObjs: WorldObject[], startSeq = 3000): WorldObject[] {
  const next = [...existingObjs];
  let seq = startSeq;
  for (const [fx, fy] of LAB_KALABAS_DROP_SPOTS) {
    const occupied = next.some((o) => o.scene === 'LAB' && o.tx === fx && o.ty === fy);
    if (!occupied) {
      next.push({
        id: `kalabas_drop_${seq++}_${fx}_${fy}`,
        scene: 'LAB',
        tx: fx,
        ty: fy,
        kind: 'FORAGE',
        itemId: 'buah_kalabas',
        quantity: 3,
        hp: 1,
        maxHp: 1,
        label: '3 Buah Kalabas Jatuh',
      });
    }
  }
  return next;
}

export function createLabSceneObjects(startSeq = 2000): WorldObject[] {
  const objs: WorldObject[] = [];
  let seq = startSeq;

  // 40 Lush Old Pohon Kalabas Tua surrounding the Lab building & forest paths
  const oldKalabasTrees: [number, number][] = [
    // Behind the Lab (north grove)
    [4, 1], [7, 1], [10, 1], [13, 1], [16, 1], [19, 1], [22, 1], [25, 1],
    // West dense Kalabas grove
    [2, 3], [5, 3], [8, 3],
    [3, 5], [7, 5],
    [2, 8], [5, 8], [8, 8],
    [3, 11], [6, 11],
    [2, 14], [5, 14], [8, 14],
    [3, 17], [7, 17], [10, 16],
    // East dense Kalabas grove
    [19, 3], [22, 3], [25, 3],
    [20, 5], [24, 5],
    [19, 8], [22, 8], [25, 8],
    [20, 11], [24, 11],
    [19, 14], [22, 14], [25, 14],
    [20, 17], [24, 17], [17, 16],
  ];

  for (const [tx, ty] of oldKalabasTrees) {
    objs.push({
      id: `obj_${seq++}`,
      scene: 'LAB',
      tx,
      ty,
      kind: 'FRUIT_TREE',
      itemId: 'buah_kalabas',
      hp: 99,
      maxHp: 99,
      harvestReady: true,
      regrowTimer: 0,
      label: 'Pohon Kalabas Tua Rimbun',
    });
  }

  // Initial fallen Kalabas clusters (3 pcs per spot, respawns every 2 days)
  return spawnFallenKalabasDrops(objs, seq + 100);
}

export function createForestSceneObjects(startSeq = 200): WorldObject[] {
  const objs: WorldObject[] = [];
  let seq = startSeq;

  // Dense, lush tropical forest trees (58 trees across north, south, west & stream groves)
  const forestTreeCoords: [number, number][] = [
    // North-west canopy
    [1, 1], [3, 1], [5, 1], [7, 1], [9, 1], [11, 1],
    [2, 3], [4, 3], [6, 3], [8, 3],
    [1, 5], [3, 5], [5, 5], [7, 5], [9, 5],
    [2, 6], [6, 6],
    // North-east canopy
    [14, 1], [16, 1], [18, 1], [20, 1], [22, 1], [24, 1],
    [15, 3], [17, 3], [19, 3],
    [14, 5], [16, 5], [18, 5], [20, 5],
    [15, 6], [19, 6], [24, 5],
    // South-west canopy
    [1, 12], [3, 12], [5, 12], [7, 12], [9, 12],
    [2, 14], [4, 14], [6, 14], [8, 14],
    [1, 16], [3, 16], [5, 16], [8, 16], [11, 16],
    // South-east canopy
    [14, 12], [16, 12], [18, 12], [20, 12], [24, 12],
    [15, 14], [17, 14], [19, 14], [24, 15],
    [14, 16], [18, 16],
  ];

  for (const [tx, ty] of forestTreeCoords) {
    objs.push({
      id: `obj_${seq++}`,
      scene: 'FOREST',
      tx,
      ty,
      kind: 'TREE',
      hp: 4,
      maxHp: 4,
      label: 'Pohon Hutan Rimbun',
    });
  }

  // Forest rocks
  const forestRocks: [number, number][] = [
    [5, 11], [14, 15], [19, 7], [8, 4], [20, 15],
  ];
  for (const [tx, ty] of forestRocks) {
    objs.push({
      id: `obj_${seq++}`,
      scene: 'FOREST',
      tx,
      ty,
      kind: 'ROCK',
      hp: 3,
      maxHp: 3,
    });
  }

  // Forest forageables
  const forageSpots: [number, number, string][] = [
    [4, 4, 'jamur_liar'],
    [17, 4, 'daun_herbal'],
    [7, 15, 'jamur_liar'],
    [19, 12, 'daun_herbal'],
    [20, 3, 'akar_ginseng'],
  ];
  for (const [tx, ty, itemId] of forageSpots) {
    objs.push({
      id: `obj_${seq++}`,
      scene: 'FOREST',
      tx,
      ty,
      kind: 'FORAGE',
      itemId,
      hp: 1,
      maxHp: 1,
    });
  }

  return objs;
}

export function createRiverSceneObjects(startSeq = 3500): WorldObject[] {
  const objs: WorldObject[] = [];
  let seq = startSeq;

  // Abundant rocks along Pinggiran Kali (52 rocks across north & south rocky banks, keeping entry path y:8..10 open)
  const riverRocks: [number, number][] = [
    // Upper rocky bank (y: 1..7)
    [6, 2], [8, 1], [10, 2], [12, 1], [14, 2],
    [7, 3], [9, 3], [11, 3], [13, 3], [15, 3],
    [6, 5], [8, 4], [10, 5], [12, 4], [14, 5],
    [7, 6], [9, 6], [11, 6], [13, 6], [15, 5],
    [4, 3], [5, 6], [3, 6], [12, 7], [15, 7],
    // Lower rocky bank (y: 11..18)
    [6, 12], [8, 11], [10, 12], [12, 11], [14, 12],
    [7, 13], [9, 13], [11, 13], [13, 13], [15, 12],
    [6, 15], [8, 14], [10, 15], [12, 14], [14, 15],
    [7, 16], [9, 16], [11, 16], [13, 16], [15, 16],
    [6, 18], [9, 18], [12, 18], [14, 18], [15, 14],
    [4, 13], [5, 16],
  ];

  for (const [tx, ty] of riverRocks) {
    objs.push({
      id: `river_rock_${seq++}`,
      scene: 'RIVER',
      tx,
      ty,
      kind: 'ROCK',
      hp: 3,
      maxHp: 3,
      label: 'Batu Kali',
    });
  }

  // Lush riverbank trees framing the western forest border
  const bankTrees: [number, number][] = [
    [2, 2], [4, 1], [2, 5], [2, 12], [4, 15], [2, 17],
  ];
  for (const [tx, ty] of bankTrees) {
    objs.push({
      id: `river_tree_${seq++}`,
      scene: 'RIVER',
      tx,
      ty,
      kind: 'TREE',
      hp: 4,
      maxHp: 4,
      label: 'Pohon Pinggir Kali',
    });
  }

  // Decorative riverside ferns/twigs
  const bankExtras: [number, number, 'WEED' | 'TWIG'][] = [
    [5, 2, 'WEED'], [11, 4, 'TWIG'], [13, 11, 'WEED'], [10, 17, 'TWIG'], [4, 17, 'WEED'],
  ];
  for (const [tx, ty, kind] of bankExtras) {
    objs.push({
      id: `river_extra_${seq++}`,
      scene: 'RIVER',
      tx,
      ty,
      kind,
      hp: kind === 'WEED' ? 1 : 2,
      maxHp: kind === 'WEED' ? 1 : 2,
    });
  }

  return objs;
}

export function createInitialWorldObjects(): WorldObject[] {
  const objs: WorldObject[] = [];
  let seq = 1;

  // Farm decorative weeds & twigs on edges
  const farmTwigs: [number, number, 'WEED' | 'TWIG' | 'ROCK'][] = [
    [19, 3, 'TWIG'], [21, 5, 'WEED'], [22, 4, 'ROCK'], [24, 14, 'WEED'],
    [22, 16, 'TWIG'], [2, 11, 'WEED'], [2, 15, 'ROCK'], [7, 17, 'WEED'],
    [13, 17, 'TWIG'], [17, 17, 'ROCK'], [21, 13, 'WEED'],
  ];
  for (const [tx, ty, kind] of farmTwigs) {
    objs.push({
      id: `obj_${seq++}`,
      scene: 'FARM',
      tx,
      ty,
      kind,
      hp: kind === 'WEED' ? 1 : 2,
      maxHp: kind === 'WEED' ? 1 : 2,
    });
  }

  objs.push(...createForestSceneObjects(seq + 100));
  objs.push(...createKebunAtasObjects(seq + 500));
  objs.push(...createLabSceneObjects(seq + 1000));
  objs.push(...createRiverSceneObjects(seq + 2000));

  return objs;
}
