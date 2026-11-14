import React, { useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { FARMER_IMAGE_URL } from '../utils/spriteLoader';
import { soundEngine } from '../utils/audio';

interface TitleScreenProps {
  hasSave: boolean;
  onContinue: () => void;
  onNewGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSave,
  onContinue,
  onNewGame,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        soundEngine.playBackgroundMusic();
        if (hasSave) onContinue();
        else onNewGame();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasSave, onContinue, onNewGame]);

  const startNewGame = () => {
    soundEngine.playBackgroundMusic();
    onNewGame();
  };

  const continueGame = () => {
    soundEngine.playBackgroundMusic();
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between p-6 sm:p-12 bg-gradient-to-r from-stone-950/92 via-stone-950/70 to-stone-950/35">
      <div />

      <div className="max-w-4xl w-full mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-10">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-block w-full max-w-[500px]">
            <svg
              viewBox="0 0 500 92"
              className="w-full h-auto mx-auto md:mx-0"
              aria-label="Lembah Kalabas"
              role="img"
            >
              <g>
                <path
                  d="M22 68C12 50 18 28 38 18C34 38 38 54 48 68C38 66 28 66 22 68Z"
                  fill="#22C55E"
                />
                <path
                  d="M42 68C48 46 66 30 82 32C68 44 62 56 58 68H42Z"
                  fill="#F59E0B"
                />
                <text
                  x="96"
                  y="56"
                  fill="#FEF3C7"
                  fontFamily="Bricolage Grotesque, system-ui, sans-serif"
                  fontWeight="800"
                  fontSize="40"
                  letterSpacing="-1"
                >
                  Lembah Kalabas
                </text>
                <text
                  x="98"
                  y="78"
                  fill="#A8A29E"
                  fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                  fontWeight="500"
                  fontSize="14"
                >
                  Pertanian 4 Musim · Hutan · Kebun Atas
                </text>
              </g>
            </svg>
          </div>

          <p className="text-sm sm:text-base text-stone-300 max-w-lg leading-relaxed mx-auto md:mx-0">
            Kelola ladang mengikuti siklus curah hujan 4 musim Indonesia (Mareng, Kemarau, Labuh, dan Penghujan), tebang kayu di hutan kanan, berbelanja serta menjual hasil panen lewat PC di rumah.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            {hasSave ? (
              <>
                <button
                  onClick={continueGame}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Lanjutkan Bertani</span>
                </button>
                <button
                  onClick={startNewGame}
                  className="px-5 py-3.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-200 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Mulai Baru</span>
                </button>
              </>
            ) : (
              <button
                onClick={startNewGame}
                className="px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base flex items-center gap-2.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Mulai Bertani</span>
              </button>
            )}
          </div>
        </div>

        <div className="w-44 sm:w-52 shrink-0 bg-stone-900/90 border border-stone-700/80 rounded-2xl p-3 shadow-2xl">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-stone-100">
            <img
              src={FARMER_IMAGE_URL}
              alt="Karakter Petani Lembah Kalabas"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="pt-2.5 text-center text-xs text-stone-300 font-medium">
            Petani Nusantara · Modal Awal 500 EG
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-stone-400 tracking-wide">
        Klik / Tap Tanah untuk Berjalan · Tahan &amp; Geser untuk Mengarahkan · Klik Petak / Objek untuk Bertani &amp; Interaksi · Klik Slot 1-9 untuk Ganti Alat
      </div>
    </div>
  );
};
