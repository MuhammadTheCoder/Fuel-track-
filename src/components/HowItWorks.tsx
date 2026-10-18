import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-16 sm:py-20" id="how">
      <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 border border-[#dce2d1] bg-white px-3 py-1.5 rounded-full text-[#4f5d3e] text-xs font-black tracking-wide shadow-2xs mb-3">
          <span className="w-2 h-2 rounded-full bg-[#8fb83f]" />
          <span>HOW IT WORKS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-[900] tracking-[-0.05em] text-[#171a16] m-0 mb-3">
          Simple enough to stick with.
        </h2>
        <p className="text-[#73796f] text-sm sm:text-base leading-relaxed m-0">
          A useful tracker should make eating well feel easier, not turn every meal into homework.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-[#e5e8df] rounded-[22px] p-6 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 bg-[#c8f169] rounded-[13px] grid place-items-center font-black text-[#11140f] text-sm">
            01
          </div>
          <h3 className="text-lg font-bold text-[#171a16] mt-4 mb-2">
            Tell it what you ate
          </h3>
          <p className="text-xs sm:text-sm text-[#73796f] leading-relaxed m-0">
            Snap a food photo or enter foods in plain language, such as “2 eggs and 1 roti with daal.” Pakistani and international foods are recognized natively.
          </p>
        </div>

        <div className="bg-white border border-[#e5e8df] rounded-[22px] p-6 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 bg-[#c8f169] rounded-[13px] grid place-items-center font-black text-[#11140f] text-sm">
            02
          </div>
          <h3 className="text-lg font-bold text-[#171a16] mt-4 mb-2">
            Review the estimate
          </h3>
          <p className="text-xs sm:text-sm text-[#73796f] leading-relaxed m-0">
            Check calories and protein computed against verified food tables. Adjust portions, oil, or sugar in one tap before saving.
          </p>
        </div>

        <div className="bg-white border border-[#e5e8df] rounded-[22px] p-6 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 bg-[#c8f169] rounded-[13px] grid place-items-center font-black text-[#11140f] text-sm">
            03
          </div>
          <h3 className="text-lg font-bold text-[#171a16] mt-4 mb-2">
            Build your daily picture
          </h3>
          <p className="text-xs sm:text-sm text-[#73796f] leading-relaxed m-0">
            Keep track of your running totals, 7-day progress, and macronutrient targets right in your browser's private local storage.
          </p>
        </div>
      </div>
    </section>
  );
};
