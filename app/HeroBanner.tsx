'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EMPLOYEE_PRESET =
  'W3sidGl0bGUiOiJOQU1FIiwidHlwZSI6Im5hbWUiLCJpZCI6ImVpZGJ3aWkyMCJ9LHsidGl0bGUiOiJFTVAgTk8iLCJ0eXBlIjoiYXV0b19udW1iZXIiLCJwcmVmaXgiOiJFTVAgIiwiaWQiOiIxc2xwN3BvOWQifSx7InRpdGxlIjoiQkFTSUMiLCJ0eXBlIjoibnVtYmVyIiwibWluIjoiNDAiLCJtYXgiOjEwMCwibXVsdGlwbGllciI6IjEwMDAiLCJpZCI6Imh4MTB3Y3F2eiJ9LHsidGl0bGUiOiJEQSIsInR5cGUiOiJudW1iZXIiLCJtaW4iOiI0NSIsIm1heCI6Ijk4IiwibXVsdGlwbGllciI6IjEwMCIsImlkIjoibzdsMGY4YmYyIn1d';

const SALES_PRESET =
  'W3sidGl0bGUiOiJTQUxFUyBSRVAiLCJ0eXBlIjoibmFtZSIsImlkIjoic3JlcDF4MiJ9LHsidGl0bGUiOiJSRUdJT04iLCJ0eXBlIjoiY2hvaWNlcyIsImNob2ljZXMiOlsiTm9ydGgiLCJTb3V0aCIsIkVhc3QiLCJXZXN0IiwiQ2VudHJhbCJdLCJpZCI6InNyZWcyeDMifSx7InRpdGxlIjoiVU5JVFMiLCJ0eXBlIjoibnVtYmVyIiwibWluIjoxMCwibWF4Ijo1MDAsIm11bHRpcGxpZXIiOjEsImlkIjoidW5pdDN4NCJ9LHsidGl0bGUiOiJVTklUIFBSSUNFIiwidHlwZSI6Im51bWJlciIsIm1pbiI6MSwibWF4Ijo1MCwibXVsdGlwbGllciI6MTAwLCJpZCI6InVwcjR4NSJ9LHsidGl0bGUiOiJESVNDT1VOVCAlIiwidHlwZSI6Im51bWJlciIsIm1pbiI6MSwibWF4IjozMCwibXVsdGlwbGllciI6MSwiaWQiOiJkaXNjNXg2In1d';

export default function HeroBanner() {
  const [visible, setVisible] = useState(false);
  const [collapsing, setCollapsing] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('rs_hero_dismissed')) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setCollapsing(true);
    localStorage.setItem('rs_hero_dismissed', '1');
    setTimeout(() => setVisible(false), 500);
  };

  const loadPreset = (s: string, c: string) => {
    localStorage.setItem('rs_hero_dismissed', '1');
    window.location.href = `?s=${s}&c=${c}`;
  };

  if (!visible) return null;

  return (
    <div
      className="overflow-hidden shrink-0"
      style={{
        maxHeight: collapsing ? 0 : '200px',
        opacity: collapsing ? 0 : 1,
        transition: 'max-height 0.5s ease-in-out, opacity 0.35s ease-in-out',
      }}
    >
      {/* Gradient top-border accent */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, rgba(99,102,241,0.7) 0%, rgba(139,92,246,0.35) 35%, transparent 70%)',
        }}
      />

      {/* Banner body */}
      <div className="relative border-l-2 border-indigo-500/30 bg-[#07070f] px-8 py-5 flex items-start gap-8">
        <div className="flex-grow min-w-0">
          {/* Headline + badge row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-1.5">
            <h2 className="font-serif italic text-white/90 text-base leading-snug">
              Generate Realistic Fake Datasets — Instantly
            </h2>
            <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 border border-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
              100% Free · No Login · Shareable via URL
            </span>
          </div>

          {/* Subtext */}
          <p className="text-[11px] text-white/40 mb-3.5 max-w-2xl leading-relaxed">
            Design your schema, set your ranges, and get shareable data for Excel, Google Sheets, or
            any analysis practice. No login. No limits.
          </p>

          {/* CTA buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => loadPreset(EMPLOYEE_PRESET, '20')}
              className="secondary-button !py-1 !px-3 !text-[11px]"
            >
              Try Employee Data
            </button>
            <button
              onClick={() => loadPreset(SALES_PRESET, '25')}
              className="secondary-button !py-1 !px-3 !text-[11px]"
            >
              Try Sales Data
            </button>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          aria-label="Dismiss banner"
          className="absolute top-3 right-4 text-white/20 hover:text-white/50 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Bottom divider */}
      <div className="h-px w-full bg-white/5" />
    </div>
  );
}
