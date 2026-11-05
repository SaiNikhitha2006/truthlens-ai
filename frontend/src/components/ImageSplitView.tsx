import React, { useState } from 'react';
import { Layers, Eye, Sliders, Maximize2, Split } from 'lucide-react';

interface ImageSplitViewProps {
  originalUrl: string;
  elaHeatmapUrl: string;
  spectralUrl: string;
  elaDiffUrl?: string;
  blendedUrl?: string;
}

export const ImageSplitView: React.FC<ImageSplitViewProps> = ({
  originalUrl,
  elaHeatmapUrl,
  spectralUrl,
  elaDiffUrl,
  blendedUrl
}) => {
  const [viewMode, setViewMode] = useState<'split_slider' | 'side_by_side' | 'blend_slider'>('split_slider');
  const [activeLayer, setActiveLayer] = useState<'ela' | 'spectral' | 'diff'>('ela');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [blendOpacity, setBlendOpacity] = useState<number>(0.65);

  const getOverlayImage = () => {
    if (activeLayer === 'spectral') return spectralUrl;
    if (activeLayer === 'diff') return elaDiffUrl || elaHeatmapUrl;
    return elaHeatmapUrl;
  };

  const overlayUrl = getOverlayImage();

  return (
    <div className="flex flex-col rounded-2xl bg-slate-deep/80 border border-slate-border p-5 shadow-xl">
      {/* View Mode Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-border/80">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-cyan" />
          <h3 className="text-base font-semibold text-white">Forensic Split-View Inspection</h3>
        </div>

        {/* View mode toggle pills */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-navy/80 border border-slate-border/60">
          <button
            onClick={() => setViewMode('split_slider')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
              viewMode === 'split_slider'
                ? 'bg-electric text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Wipe Split</span>
          </button>

          <button
            onClick={() => setViewMode('side_by_side')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
              viewMode === 'side_by_side'
                ? 'bg-electric text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => setViewMode('blend_slider')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
              viewMode === 'blend_slider'
                ? 'bg-electric text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Alpha Blend</span>
          </button>
        </div>
      </div>

      {/* Layer Selector */}
      <div className="flex items-center justify-between py-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 font-medium">Comparison Layer:</span>
          <button
            onClick={() => setActiveLayer('ela')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              activeLayer === 'ela'
                ? 'bg-cyan/20 text-cyan border border-cyan/40'
                : 'bg-navy/60 text-gray-400 hover:text-gray-200'
            }`}
          >
            ELA Turbo Heatmap
          </button>
          <button
            onClick={() => setActiveLayer('spectral')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              activeLayer === 'spectral'
                ? 'bg-cyan/20 text-cyan border border-cyan/40'
                : 'bg-navy/60 text-gray-400 hover:text-gray-200'
            }`}
          >
            2D FFT Frequency
          </button>
          {elaDiffUrl && (
            <button
              onClick={() => setActiveLayer('diff')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                activeLayer === 'diff'
                  ? 'bg-cyan/20 text-cyan border border-cyan/40'
                  : 'bg-navy/60 text-gray-400 hover:text-gray-200'
              }`}
            >
              Raw Difference
            </button>
          )}
        </div>

        {/* Dynamic Controls based on viewMode */}
        {viewMode === 'blend_slider' && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-xs">Heatmap Opacity:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={blendOpacity}
              onChange={(e) => setBlendOpacity(parseFloat(e.target.value))}
              className="w-24 accent-cyan cursor-pointer"
            />
            <span className="text-cyan font-mono text-[11px] w-8">
              {Math.round(blendOpacity * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Main Canvas / Viewer */}
      <div className="relative w-full min-h-[380px] max-h-[520px] rounded-xl overflow-hidden bg-navy-dark border border-slate-border/80 flex items-center justify-center p-2">
        {viewMode === 'split_slider' && (
          <div 
            className="relative w-full h-[460px] select-none overflow-hidden cursor-ew-resize flex items-center justify-center"
            onMouseMove={(e) => {
              if (e.buttons === 1) {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = ((e.clientX - rect.left) / rect.width) * 100;
                setSliderPosition(Math.max(0, Math.min(100, pos)));
              }
            }}
            onTouchMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const touch = e.touches[0];
              const pos = ((touch.clientX - rect.left) / rect.width) * 100;
              setSliderPosition(Math.max(0, Math.min(100, pos)));
            }}
          >
            {/* Background Image: Original */}
            <img
              src={originalUrl}
              alt="Original Asset"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Foreground Image: Forensic Layer with clip-path */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={overlayUrl}
                alt="Forensic Layer"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan shadow-glow-cyan z-20 pointer-events-none flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 -ml-4 rounded-full bg-slate-deep border-2 border-cyan shadow-lg flex items-center justify-center">
                <Split className="w-4 h-4 text-cyan" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-navy/85 border border-cyan/40 text-[11px] font-semibold text-cyan z-10 pointer-events-none">
              {activeLayer.toUpperCase()} OVERLAY ({Math.round(sliderPosition)}%)
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-navy/85 border border-slate-border text-[11px] font-semibold text-gray-300 z-10 pointer-events-none">
              ORIGINAL ASSET
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-navy/90 border border-slate-border text-[10px] text-gray-400 pointer-events-none">
              Drag horizontally across image to wipe compare
            </div>
          </div>
        )}

        {viewMode === 'side_by_side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-[460px] p-2">
            <div className="relative rounded-lg overflow-hidden bg-navy border border-slate-border flex flex-col items-center justify-center">
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/70 text-[10px] font-medium text-gray-300">
                Original Input
              </span>
              <img src={originalUrl} alt="Original" className="w-full h-full object-contain" />
            </div>

            <div className="relative rounded-lg overflow-hidden bg-navy border border-slate-border flex flex-col items-center justify-center">
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/70 text-[10px] font-medium text-cyan border border-cyan/30">
                {activeLayer.toUpperCase()} Forensic Map
              </span>
              <img src={overlayUrl} alt="Forensic Inspection" className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        {viewMode === 'blend_slider' && (
          <div className="relative w-full h-[460px] flex items-center justify-center">
            {/* Base: Original */}
            <img
              src={originalUrl}
              alt="Original"
              className="absolute inset-0 w-full h-full object-contain"
            />
            {/* Blended Layer */}
            <img
              src={overlayUrl}
              alt="Forensic Overlay"
              className="absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-150"
              style={{ opacity: blendOpacity }}
            />
            <div className="absolute bottom-3 left-4 px-3 py-1 rounded-md bg-navy/85 border border-slate-border text-[11px] text-gray-300">
              Screen Blend: {Math.round(blendOpacity * 100)}% Forensic Opacity
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
