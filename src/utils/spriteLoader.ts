export const FARMER_IMAGE_URL = '/assets/aistudio/image_83e00232_349e8689.jpg';

let cachedFarmerSprite: HTMLCanvasElement | null = null;
let loadingPromise: Promise<HTMLCanvasElement> | null = null;

/**
 * Loads the uploaded farmer image and flood-fills near-white background pixels
 * starting from the outer edges so the white background becomes transparent
 * while preserving the character's white t-shirt inside the dark outline!
 */
export function loadCleanFarmerSprite(): Promise<HTMLCanvasElement> {
  if (cachedFarmerSprite) return Promise.resolve(cachedFarmerSprite);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(canvas);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      const visited = new Uint8Array(w * h);
      const queue = new Int32Array(w * h);
      let head = 0;
      let tail = 0;

      const isNearWhite = (idx: number) => {
        const p = idx * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        return min > 218 && max - min < 28;
      };

      const push = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= w || y >= h) return;
        const idx = y * w + x;
        if (visited[idx]) return;
        if (!isNearWhite(idx)) return;
        visited[idx] = 1;
        queue[tail++] = idx;
      };

      // Seed flood-fill along all 4 image borders
      for (let x = 0; x < w; x++) {
        push(x, 0);
        push(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        push(0, y);
        push(w - 1, y);
      }

      while (head < tail) {
        const idx = queue[head++];
        const p = idx * 4;
        data[p + 3] = 0; // transparent

        const x = idx % w;
        const y = (idx / w) | 0;
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
      }

      // Soften 1px fringe around removed background pixels
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          if (visited[idx]) continue;
          const p = idx * 4;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];
          if (Math.min(r, g, b) > 195 && Math.max(r, g, b) - Math.min(r, g, b) < 30) {
            const hasBgNeighbor =
              visited[idx - 1] || visited[idx + 1] || visited[idx - w] || visited[idx + w];
            if (hasBgNeighbor) {
              data[p + 3] = Math.min(data[p + 3], 90);
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      cachedFarmerSprite = canvas;
      resolve(canvas);
    };
    img.onerror = () => {
      const fallback = document.createElement('canvas');
      fallback.width = 64;
      fallback.height = 128;
      cachedFarmerSprite = fallback;
      resolve(fallback);
    };
    img.src = FARMER_IMAGE_URL;
  });

  return loadingPromise;
}
