import React from 'react';
import { DollarSign, Construction } from 'lucide-react';

const PricingPage = () => {
  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <DollarSign className="text-yellow-500" size={32} />
            Pricing Configuration
          </h1>
          <p className="text-[var(--theme-text-muted)]">
            Manage global service rates and custom package pricing.
          </p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
          <Construction size={48} className="text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-[var(--theme-text-muted)] max-w-md mx-auto">
          The automated Pricing Configuration module is currently under active development. This feature will be available in the upcoming Phase 3 release.
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
