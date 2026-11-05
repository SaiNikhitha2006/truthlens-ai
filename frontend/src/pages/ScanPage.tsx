import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, Search, Image as ImageIcon, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { ForensicAnalysisResult, SampleImage } from '../types';
import { SampleImagePicker } from '../components/SampleImagePicker';
import { api } from '../services/api';

interface ScanPageProps {
  onScanComplete: (result: ForensicAnalysisResult) => void;
  samples: SampleImage[];
}

export const ScanPage: React.FC<ScanPageProps> = ({ onScanComplete, samples }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setErrorMessage(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const executeAnalysis = async () => {
    setErrorMessage(null);
    setLoading(true);

    try {
      setLoadingStage('Computing SHA-256 & 64-bit DCT Perceptual Fingerprint...');
      await new Promise(r => setTimeout(r, 400));

      setLoadingStage('Executing Error Level Analysis (90% Quality Discrepancy)...');
      await new Promise(r => setTimeout(r, 400));

      setLoadingStage('Performing 2D FFT Frequency & Radial Spectral Profiling...');
      
      let result: ForensicAnalysisResult;

      if (selectedFile) {
        result = await api.analyzeUpload(selectedFile);
      } else if (previewUrl && previewUrl.startsWith('data:image')) {
        result = await api.analyzeUrl(undefined, previewUrl);
      } else if (urlInput.trim()) {
        result = await api.analyzeUrl(urlInput.trim(), undefined);
      } else {
        throw new Error('Please select an image file or provide a valid image URL.');
      }

      setLoadingStage('Synthesizing Trust Index & Anomaly Risk Matrix...');
      await new Promise(r => setTimeout(r, 300));

      onScanComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Forensic analysis failed. Please verify file integrity.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const handleSampleSelected = async (sample: SampleImage) => {
    setPreviewUrl(sample.data_url);
    setSelectedFile(null);
    setUrlInput('');
    setErrorMessage(null);
    setLoading(true);

    try {
      setLoadingStage(`Analyzing benchmark sample: ${sample.title}...`);
      const result = await api.analyzeUrl(undefined, sample.data_url);
      onScanComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Sample analysis failed.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Upload & Forensic Scan Center</h2>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Ingest raw images or remote URLs to extract compression anomalies, frequency spectrum spikes, and verify against the global fingerprint database.
        </p>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          dragActive
            ? 'border-cyan bg-cyan/10 shadow-glow-cyan'
            : 'border-slate-border bg-slate-deep/50 hover:bg-slate-deep/75'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileInput}
          className="hidden"
        />

        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative max-w-md mx-auto h-64 rounded-2xl overflow-hidden bg-navy-dark border border-slate-border shadow-inner">
              <img
                src={previewUrl}
                alt="Selected Image Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                disabled={loading}
                onClick={executeAnalysis}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric to-blue-600 hover:from-blue-600 hover:to-electric text-white font-semibold text-sm shadow-glow-electric flex items-center space-x-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Forensics...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run Full Forensic Analysis</span>
                  </>
                )}
              </button>

              <button
                disabled={loading}
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setUrlInput('');
                }}
                className="px-4 py-2.5 rounded-xl bg-navy border border-slate-border text-gray-400 hover:text-white text-sm font-medium transition"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-electric/15 border border-electric/30 flex items-center justify-center mx-auto text-electric shadow-glow-electric">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <p className="text-base font-semibold text-white">
                Drag & Drop high-resolution asset here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-cyan underline hover:text-electric transition"
                >
                  browse local device
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports JPG, PNG, WEBP, and AVIF up to 25MB
              </p>
            </div>

            {/* URL Loader Alternative */}
            <div className="max-w-md mx-auto pt-3">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="Or paste public image URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy/80 border border-slate-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan"
                  />
                </div>
                <button
                  onClick={() => {
                    if (urlInput.trim()) {
                      setPreviewUrl(urlInput.trim());
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-border hover:bg-slate-hover text-xs font-semibold text-cyan transition"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Progress Bar */}
        {loading && (
          <div className="mt-6 p-4 rounded-xl bg-navy/90 border border-cyan/40 max-w-md mx-auto space-y-2 animate-pulse">
            <div className="flex items-center justify-center space-x-2 text-cyan text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{loadingStage}</span>
            </div>
            <div className="w-full bg-slate-deep rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-electric to-cyan h-1.5 rounded-full animate-indeterminate" />
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center justify-center space-x-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Benchmark Samples Picker */}
      <SampleImagePicker
        samples={samples}
        onSelectSample={handleSampleSelected}
        isLoading={loading}
      />
    </div>
  );
};
