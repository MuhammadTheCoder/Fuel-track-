import React, { useState } from 'react';
import { DailyTargets } from '../types/nutrition';
import { WeeklyReportData, generateWeeklyReport } from '../utils/storage';
import {
  X,
  Flame,
  Dumbbell,
  Droplet,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface WeeklyReportModalProps {
  userId: string;
  userName: string;
  targets: DailyTargets;
  onClose: () => void;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  userId,
  userName,
  targets,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const report: WeeklyReportData = generateWeeklyReport(userId, targets);

  const handleCopyReport = () => {
    const textSummary = `📊 FUELTRACK WEEKLY NUTRITION REPORT
Profile: ${userName}
Period: ${report.startDate} to ${report.endDate}

⚡ CALORIES:
• 7-Day Average: ${report.averageCalories} kcal/day
• Daily Target: ${report.targetCalories} kcal/day (${report.calorieAdherencePercent}%)

💪 PROTEIN:
• 7-Day Average: ${report.averageProtein}g/day
• Daily Target: ${report.targetProtein}g/day (${report.proteinAdherencePercent}%)

🌾 MACRONUTRIENTS:
• Carbs: ${report.averageCarbs}g/day (Target: ${report.targetCarbs}g)
• Healthy Fats: ${report.averageFat}g/day (Target: ${report.targetFat}g)

💧 HYDRATION:
• 7-Day Average: ${report.averageWaterMl} ml/day
• Target: ${report.targetWaterMl} ml/day (${report.waterAdherencePercent}%)

📈 CONSISTENCY:
• Days Logged: ${report.daysWithLogs}/7
• Days within Calorie Range: ${report.daysMetCalorieRange}/7
• Days Protein Target Met: ${report.daysMetProtein}/7
• Days Hydration Target Met: ${report.daysMetWater}/7

💡 KEY INSIGHTS:
${report.insights.map((ins) => `• ${ins}`).join('\n')}

Generated with FuelTrack AI Nutrition Tracker`;

    navigator.clipboard?.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#11140F]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-[26px] sm:rounded-[32px] max-w-2xl w-full border border-[#E5E8DF] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#11140F] text-white p-5 sm:p-6 flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#C8F169]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#C8F169] text-[#11140F] grid place-items-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-[900] text-base sm:text-xl leading-tight text-white m-0 font-heading">
                  Weekly Nutrition Report
                </h2>
                <span className="text-[10px] font-extrabold uppercase bg-[#20251E] text-[#C8F169] px-2 py-0.5 rounded-full border border-[#343A30]">
                  7-Day Trends
                </span>
              </div>
              <p className="text-[#858B80] text-xs m-0 mt-0.5 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{report.startDate} to {report.endDate} · {userName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-0"
              title="Copy formatted summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#C8F169]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#A6AD9E] hover:text-white grid place-items-center transition cursor-pointer border-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 max-h-[78vh] overflow-y-auto space-y-6">
          {/* Quick Scorecard Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Calories Card */}
            <div className="bg-[#FAFBF8] border border-[#E5E8DF] rounded-2xl p-3.5">
              <div className="flex items-center justify-between text-[#858B80] text-[11px] font-extrabold uppercase mb-1">
                <span>Avg Energy</span>
                <Flame className="w-3.5 h-3.5 text-[#E65100]" />
              </div>
              <strong className="text-xl sm:text-2xl font-[900] text-[#11140F] block font-heading">
                {report.averageCalories}
                <span className="text-xs font-normal text-[#858B80] ml-1">kcal</span>
              </strong>
              <div className="text-[11px] text-[#858B80] mt-1">
                Target: {report.targetCalories} kcal ({report.calorieAdherencePercent}%)
              </div>
            </div>

            {/* Protein Card */}
            <div className="bg-[#FAFBF8] border border-[#E5E8DF] rounded-2xl p-3.5">
              <div className="flex items-center justify-between text-[#858B80] text-[11px] font-extrabold uppercase mb-1">
                <span>Avg Protein</span>
                <Dumbbell className="w-3.5 h-3.5 text-[#739A30]" />
              </div>
              <strong className="text-xl sm:text-2xl font-[900] text-[#11140F] block font-heading">
                {report.averageProtein}
                <span className="text-xs font-normal text-[#858B80] ml-1">g</span>
              </strong>
              <div className="text-[11px] text-[#858B80] mt-1">
                Target: {report.targetProtein}g ({report.proteinAdherencePercent}%)
              </div>
            </div>

            {/* Carbs & Fat Card */}
            <div className="bg-[#FAFBF8] border border-[#E5E8DF] rounded-2xl p-3.5">
              <div className="flex items-center justify-between text-[#858B80] text-[11px] font-extrabold uppercase mb-1">
                <span>Carbs & Fat</span>
                <Sparkles className="w-3.5 h-3.5 text-[#C8F169]" />
              </div>
              <strong className="text-sm font-black text-[#11140F] block font-heading mt-1">
                {report.averageCarbs}g C · {report.averageFat}g F
              </strong>
              <div className="text-[11px] text-[#858B80] mt-1">
                Goals: {report.targetCarbs}g / {report.targetFat}g
              </div>
            </div>

            {/* Hydration Card */}
            <div className="bg-[#F0F8FF] border border-[#BAE6FD] rounded-2xl p-3.5">
              <div className="flex items-center justify-between text-[#0369A1] text-[11px] font-extrabold uppercase mb-1">
                <span>Avg Fluids</span>
                <Droplet className="w-3.5 h-3.5 text-[#0284C7] fill-[#0284C7]" />
              </div>
              <strong className="text-xl sm:text-2xl font-[900] text-[#0369A1] block font-heading">
                {report.averageWaterMl}
                <span className="text-xs font-normal text-[#0369A1]/80 ml-1">ml</span>
              </strong>
              <div className="text-[11px] text-[#0369A1]/80 mt-1">
                Target: {report.targetWaterMl} ml ({report.waterAdherencePercent}%)
              </div>
            </div>
          </div>

          {/* 7-DAY VISUAL TREND BAR CHART */}
          <div className="bg-[#FAFBF8] border border-[#E5E8DF] rounded-[24px] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase text-[#11140F] tracking-wider">
                Daily Intake vs Targets
              </span>
              <div className="flex items-center gap-3 text-[11px] font-bold text-[#858B80]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#11140F]" /> Calories
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#739A30]" /> Protein
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" /> Water
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 items-end min-h-[140px] pt-4 border-b border-[#E5E8DF] pb-3">
              {report.days.map((day) => {
                const calHeight = Math.min(100, Math.round((day.calories / Math.max(1, report.targetCalories)) * 90));
                const protHeight = Math.min(100, Math.round((day.protein / Math.max(1, report.targetProtein)) * 90));
                const waterHeight = Math.min(100, Math.round((day.waterMl / Math.max(1, report.targetWaterMl)) * 90));

                return (
                  <div key={day.dateString} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-full flex justify-center items-end gap-1 h-[100px]">
                      {/* Calories bar */}
                      <div
                        className="w-2 sm:w-2.5 bg-[#11140F] rounded-t-sm transition-all"
                        style={{ height: `${Math.max(4, calHeight)}%` }}
                        title={`${day.displayLabel}: ${day.calories} kcal`}
                      />
                      {/* Protein bar */}
                      <div
                        className="w-2 sm:w-2.5 bg-[#739A30] rounded-t-sm transition-all"
                        style={{ height: `${Math.max(4, protHeight)}%` }}
                        title={`${day.displayLabel}: ${day.protein}g protein`}
                      />
                      {/* Water bar */}
                      <div
                        className="w-2 sm:w-2.5 bg-[#0284C7] rounded-t-sm transition-all"
                        style={{ height: `${Math.max(4, waterHeight)}%` }}
                        title={`${day.displayLabel}: ${day.waterMl} ml water`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#858B80] group-hover:text-[#11140F]">
                      {day.displayLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Daily Data Table Summary */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E8DF]">
                <span className="text-[#858B80] block text-[10px] uppercase font-bold">Logged Days</span>
                <strong className="text-sm text-[#11140F] font-heading">{report.daysWithLogs} of 7 days</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E8DF]">
                <span className="text-[#858B80] block text-[10px] uppercase font-bold">Calorie Range</span>
                <strong className="text-sm text-[#11140F] font-heading">{report.daysMetCalorieRange} days on target</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E8DF]">
                <span className="text-[#858B80] block text-[10px] uppercase font-bold">Protein Met</span>
                <strong className="text-sm text-[#11140F] font-heading">{report.daysMetProtein} days &ge; 90%</strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E8DF]">
                <span className="text-[#858B80] block text-[10px] uppercase font-bold">Hydration Met</span>
                <strong className="text-sm text-[#11140F] font-heading">{report.daysMetWater} days &ge; 90%</strong>
              </div>
            </div>
          </div>

          {/* PERSONALIZED NUTRITIONAL INSIGHTS */}
          <div className="bg-[#FAFBF8] border border-[#E5E8DF] rounded-[24px] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#739A30]" />
              <h3 className="text-xs font-black uppercase text-[#11140F] tracking-wider m-0">
                Weekly Nutritional Insights
              </h3>
            </div>

            <div className="space-y-2">
              {report.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E5E8DF] rounded-xl p-3 text-xs text-[#11140F] leading-relaxed flex items-start gap-2 shadow-2xs"
                >
                  <span className="shrink-0">{insight.slice(0, 2)}</span>
                  <span>{insight.slice(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Educational & Advisory Footer */}
          <div className="bg-[#F0F2EC] rounded-2xl p-4 text-[11px] text-[#858B80] leading-relaxed">
            <strong className="text-[#11140F] block mb-0.5">Nutritional Note:</strong>
            FuelTrack calculations are evidence-informed estimates designed to support healthy habits and fitness progress. They are not medical prescriptions. Adjust values according to your body's energy levels and recovery.
          </div>
        </div>
      </div>
    </div>
  );
};
