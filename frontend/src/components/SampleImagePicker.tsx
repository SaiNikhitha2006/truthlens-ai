import React from 'react';
import { SampleImage } from '../types';
import { Sparkles, ShieldCheck, Scissors, ArrowRight } from 'lucide-react';

interface SampleImagePickerProps {
  samples: SampleImage[];
  onSelectSample: (sample: SampleImage) => void;
  isLoading?: boolean;
}

export const SampleImagePicker: React.FC<SampleImagePickerProps> = ({
  samples,
  onSelectSample,
  isLoading
}) => {
  if (!samples || samples.length === 0) return null;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'AUTHENTIC':
        return {
          icon: ShieldCheck,
          text: 'Authentic Photo',
          color: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
        };
      case 'AI_GENERATED':
        return {
          icon: Sparkles,
          text: 'AI Synthesis (GAN/Diffusion)',
          color: 'bg-pink-500/15 border-pink-500/40 text-pink-400'
        };
      case 'MANIPULATED':
      default:
        return {
          icon: Scissors,
          text: 'Spliced / Doctored',
          color: 'bg-red-500/15 border-red-500/40 text-red-400'
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Or Test with Pre-Loaded Forensic Benchmark Samples:
        </span>
        <span className="text-[11px] text-cyan font-medium">1-Click Immediate Analysis</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {samples.map((sample) => {
          const badge = getTypeBadge(sample.type);
          const Icon = badge.icon;

          return (
            <div
              key={sample.id}
              onClick={() => !isLoading && onSelectSample(sample)}
              className="group cursor-pointer p-3 rounded-xl bg-slate-deep/70 border border-slate-border hover:border-cyan/50 hover:bg-slate-deep transition-all duration-200 flex flex-col justify-between hover:shadow-glow-cyan"
            >
              <div className="space-y-2">
                <div className="relative h-28 rounded-lg overflow-hidden bg-navy-dark border border-slate-border/50">
                  <img
                    src={sample.data_url}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center space-x-1 ${badge.color}`}>
                    <Icon className="w-3 h-3" />
                    <span>{badge.text}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-cyan transition-colors">
                    {sample.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-snug mt-1 line-clamp-2">
                    {sample.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-border/50 flex items-center justify-between text-[11px] text-cyan group-hover:translate-x-0.5 transition-transform">
                <span className="font-semibold">Run Forensics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
