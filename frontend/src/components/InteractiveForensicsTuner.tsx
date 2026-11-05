import React, { useState } from 'react';
import { Sliders, RefreshCw, Palette, Layers, Loader2 } from 'lucide-react';
import { ElaResult } from '../types';
import { api } from '../services/api';

interface InteractiveForensicsTunerProps {
  originalImageBase64: string;
  currentEla: ElaResult;
  onElaUpdated: (newEla: ElaResult) => void;
}

export const InteractiveForensicsTuner: React.FC<InteractiveForensicsTunerProps> = ({
  originalImageBase64,
  currentEla,
  onElaUpdated
}) => {
  const [quality, setQuality] = useState<number>(currentEla.quality_tested || 90);
  const [scale, setScale] = useState<number>(currentEla.scale_factor || 20);
  const [colormap, setColormap] = useState<string>(currentEla.colormap_used || 'turbo');
  const [loading, setLoading] = useState<boolean>(false);

  const colormaps = [
    { id: 'turbo', label: 'Turbo (Default)' },
    { id: 'jet', label: 'Jet' },
    { id: 'inferno', label: 'Inferno' },
    { id: 'viridis', label: 'Viridis' },
    { id: 'bone', label: 'Bone' },
    { id: 'ocean', label: 'Ocean' }
  ];

  const handleApplyTuning = async (q = quality, s = scale, cm = colormap) => {
    try {
      setLoading(true);
      const res = await api.tuneEla(originalImageBase64, q, s, cm);
      onElaUpdated(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQualityChange = (val: number) => {
    setQuality(val);
  };

  const handleScaleChange = (val: number) => {
    setScale(val);
  };

  const handleColormapSelect = (cmId: string) => {
    setColormap(cmId);
    handleApplyTuning(quality, scale, cmId);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-deep/75 border border-slate-border space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-border/80">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan" />
          <h3 className="text-base font-semibold text-white">Live Forensic Parameter Tuner</h3>
        </div>
        <button
          disabled={loading}
          onClick={() => handleApplyTuning(quality, scale, colormap)}
          className="px-3.5 py-1.5 rounded-lg bg-electric hover:bg-electric-hover text-white text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Re-Compute ELA</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        {/* Quality slider */}
        <div className="space-y-1.5 bg-navy/60 p-3 rounded-xl border border-slate-border/60">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-300">Resave JPEG Quality:</span>
            <span className="text-cyan font-mono">{quality}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="98"
            step="1"
            value={quality}
            onChange={(e) => handleQualityChange(parseInt(e.target.value))}
            className="w-full accent-cyan cursor-pointer"
          />
          <span className="text-[10px] text-gray-400 block">
            Higher quality isolates subtle multi-generation quantization discrepancies.
          </span>
        </div>

        {/* Contrast Multiplier */}
        <div className="space-y-1.5 bg-navy/60 p-3 rounded-xl border border-slate-border/60">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-300">Contrast Multiplier Gain:</span>
            <span className="text-electric font-mono">{scale}x</span>
          </div>
          <input
            type="range"
            min="5"
            max="45"
            step="5"
            value={scale}
            onChange={(e) => handleScaleChange(parseInt(e.target.value))}
            className="w-full accent-electric cursor-pointer"
          />
          <span className="text-[10px] text-gray-400 block">
            Amplifies pixel delta brightness for visual inspection of tampered blocks.
          </span>
        </div>

        {/* Colormaps */}
        <div className="space-y-1.5 bg-navy/60 p-3 rounded-xl border border-slate-border/60">
          <span className="text-gray-300 font-semibold block">Heatmap Colormap:</span>
          <div className="grid grid-cols-3 gap-1.5">
            {colormaps.map((cm) => (
              <button
                key={cm.id}
                onClick={() => handleColormapSelect(cm.id)}
                className={`py-1 px-1.5 rounded text-[10px] font-semibold transition ${
                  colormap === cm.id
                    ? 'bg-cyan text-navy-dark shadow-sm'
                    : 'bg-navy text-gray-400 hover:text-white'
                }`}
              >
                {cm.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
