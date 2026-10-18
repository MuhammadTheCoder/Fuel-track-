import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-[#e5e8df]/80 text-[#73796f] text-xs">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#171a16] font-bold text-sm">
            <span className="w-5 h-5 rounded-md bg-[#c8f169] text-[#11140f] text-xs grid place-items-center font-black">
              F
            </span>
            <span>fueltrack AI</span>
            <span className="text-xs text-[#73796f] font-normal">· Eat well. Fuel your strength.</span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#73796f] max-w-md m-0">
            Privacy first: Your logged meals and custom nutrition goals are saved strictly in your browser's local storage. Uploaded photos are processed securely via ephemeral server endpoints and never permanently retained.
          </p>
        </div>

        <div className="text-[11px] leading-relaxed max-w-lg text-[#73796f] bg-white border border-[#e5e8df] rounded-xl p-3">
          <strong className="text-[#171a16] block mb-0.5">Health & Safety Notice:</strong>
          Nutritional figures are approximate estimates for educational self-tracking, not medical prescriptions. If you are under 18 or still growing, prioritize adequate energy, strength, and wholesome meals rather than restrictive calorie counting.
        </div>
      </div>
    </footer>
  );
};
