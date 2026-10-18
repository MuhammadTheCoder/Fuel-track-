import React, { useState, useEffect, useRef } from 'react';
import {
  MealEntry,
  DailyTargets,
  MealCategory,
  MealAnalysisResult,
  UserAccount,
} from './types/nutrition';
import {
  getAllAccounts,
  getActiveAccount,
  setActiveAccountId,
  saveAccount,
  deleteAccount,
  getMealsForUser,
  saveMealForUser,
  deleteMealForUser,
  clearMealsForUserAndDate,
  getUserPast7Days,
  getWaterForUserAndDate,
  addWaterForUserAndDate,
  setWaterForUserAndDate,
  formatLocalDate,
  DEFAULT_FALLBACK_TARGETS,
} from './utils/storage';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MealTracker } from './components/MealTracker';
import { DailyDashboard } from './components/DailyDashboard';
import { MealReviewModal } from './components/MealReviewModal';
import { NutritionGoalsModal } from './components/NutritionGoalsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { WeeklyReportModal } from './components/WeeklyReportModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { LoadingScreen } from './components/LoadingScreen';
import { HowItWorks } from './components/HowItWorks';
import { ApproachSection } from './components/ApproachSection';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

export default function App() {
  // Account & Multi-user State
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);

  // App initialization & Splash state
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isAddingNewProfile, setIsAddingNewProfile] = useState<boolean>(false);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState<boolean>(false);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState<boolean>(false);

  // Meals & Water for active account & selected date
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDate());
  const [waterMl, setWaterMl] = useState<number>(0);

  // Review modal state
  const [reviewData, setReviewData] = useState<{
    result: MealAnalysisResult;
    mealType: MealCategory;
    mealName?: string;
    photoPreviewUrl?: string | null;
  } | null>(null);

  // Quick Action / tracker tab sync
  const [trackerTab, setTrackerTab] = useState<'text' | 'photo' | 'manual'>('text');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Navigation refs
  const trackerSectionRef = useRef<HTMLDivElement>(null);
  const dashboardSectionRef = useRef<HTMLDivElement>(null);

  // Initialize accounts on mount
  useEffect(() => {
    const accounts = getAllAccounts();
    setAllAccounts(accounts);
    if (accounts.length > 0) {
      const active = getActiveAccount() || accounts[0];
      setActiveAccount(active);
      setMeals(getMealsForUser(active.id));
      setWaterMl(getWaterForUserAndDate(active.id, selectedDate));
    }
  }, []);

  // Sync meals & water when active user or selected date changes
  useEffect(() => {
    if (activeAccount) {
      setMeals(getMealsForUser(activeAccount.id));
      setWaterMl(getWaterForUserAndDate(activeAccount.id, selectedDate));
    }
  }, [activeAccount, selectedDate]);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const scrollToTracker = () => {
    trackerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDashboard = () => {
    dashboardSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Called when minimal splash screen completes initialization
  const handleSplashFinish = () => {
    setShowSplash(false);
    const accounts = getAllAccounts();
    if (accounts.length === 0) {
      // New user -> show personalized onboarding immediately
      setIsAddingNewProfile(false);
      setIsOnboardingOpen(true);
    }
  };

  // Called when a user completes the 8-step onboarding flow
  const handleOnboardingComplete = (newAccount: UserAccount) => {
    saveAccount(newAccount);
    const updatedAccounts = getAllAccounts();
    setAllAccounts(updatedAccounts);
    setActiveAccount(newAccount);
    setMeals(getMealsForUser(newAccount.id));
    setWaterMl(getWaterForUserAndDate(newAccount.id, selectedDate));
    setIsOnboardingOpen(false);
    setIsAddingNewProfile(false);

    showToast(
      `Welcome ${newAccount.name}! Your daily target is set to ${newAccount.targets.calories.toLocaleString()} kcal & ${newAccount.targets.protein}g protein.`
    );
  };

  // Switch between existing user profiles on this device
  const handleSwitchAccount = (accountId: string) => {
    setActiveAccountId(accountId);
    const accounts = getAllAccounts();
    const switched = accounts.find((a) => a.id === accountId) || accounts[0];
    if (switched) {
      setActiveAccount(switched);
      setMeals(getMealsForUser(switched.id));
      setWaterMl(getWaterForUserAndDate(switched.id, selectedDate));
      showToast(`Switched profile to ${switched.name}`);
    }
  };

  // Update existing profile & recalculated targets
  const handleUpdateAccount = (updated: UserAccount) => {
    saveAccount(updated);
    const accounts = getAllAccounts();
    setAllAccounts(accounts);
    setActiveAccount(updated);
    showToast(`Updated targets for ${updated.name}: ${updated.targets.calories} kcal!`);
  };

  // Delete profile
  const handleDeleteAccount = (accountId: string) => {
    deleteAccount(accountId);
    const remaining = getAllAccounts();
    setAllAccounts(remaining);
    if (remaining.length > 0) {
      const nextActive = getActiveAccount() || remaining[0];
      setActiveAccount(nextActive);
      setMeals(getMealsForUser(nextActive.id));
      setWaterMl(getWaterForUserAndDate(nextActive.id, selectedDate));
      showToast(`Profile removed. Active profile: ${nextActive.name}`);
    } else {
      setActiveAccount(null);
      setMeals([]);
      setWaterMl(0);
      setIsAddingNewProfile(false);
      setIsOnboardingOpen(true);
    }
  };

  // Add brand new profile
  const handleAddNewProfile = () => {
    setIsAddingNewProfile(true);
    setIsOnboardingOpen(true);
  };

  // Meal & Water management for active account
  const activeUserId = activeAccount?.id || 'default_user';
  const activeTargets: DailyTargets = activeAccount?.targets || DEFAULT_FALLBACK_TARGETS;

  const dateMeals = meals.filter((m) => m.dateString === selectedDate);
  const todayMeals = meals.filter((m) => m.dateString === formatLocalDate());
  const past7Days = getUserPast7Days(activeUserId, activeTargets);

  // Water tracking actions
  const handleAddWater = (deltaMl: number) => {
    const updated = addWaterForUserAndDate(activeUserId, selectedDate, deltaMl);
    setWaterMl(updated);
    if (deltaMl > 0) {
      const target = activeTargets.waterMl || 2500;
      if (updated >= target && updated - deltaMl < target) {
        showToast(`🎉 Daily hydration goal reached! (${updated} ml logged)`);
      } else {
        showToast(`+${deltaMl} ml added! (${updated} / ${target} ml)`);
      }
    }
  };

  const handleResetWater = () => {
    setWaterForUserAndDate(activeUserId, selectedDate, 0);
    setWaterMl(0);
    showToast('Water intake reset for today');
  };

  // Analysis result from AI Vision or natural language
  const handleAnalysisSuccess = (
    result: MealAnalysisResult,
    mealType: MealCategory,
    mealName?: string,
    photoDataUrl?: string | null
  ) => {
    setReviewData({
      result,
      mealType,
      mealName,
      photoPreviewUrl: photoDataUrl,
    });
  };

  // Save meal to current user's log
  const handleSaveMeal = (meal: MealEntry) => {
    const updatedMeals = saveMealForUser(activeUserId, {
      ...meal,
      userId: activeUserId,
    });
    setMeals(updatedMeals);
    setReviewData(null);
    showToast(`"${meal.name}" added to log!`);
  };

  // Edit existing meal
  const handleEditMeal = (meal: MealEntry) => {
    const reconstructedResult: MealAnalysisResult = {
      foods: meal.foods,
      total_calories_kcal: meal.calories,
      total_protein_g: meal.protein,
      total_carbs_g: meal.carbs,
      total_fat_g: meal.fat,
      assumptions: meal.assumptions || [],
      needs_confirmation: false,
      source: meal.source,
    };

    setReviewData({
      result: reconstructedResult,
      mealType: meal.mealType,
      mealName: meal.name,
      photoPreviewUrl: meal.photoUrl || null,
    });
  };

  // Delete meal
  const handleDeleteMeal = (mealId: string) => {
    const targetMeal = meals.find((m) => m.id === mealId);
    if (!targetMeal) return;

    if (window.confirm(`Are you sure you want to remove "${targetMeal.name}"?`)) {
      const updated = deleteMealForUser(activeUserId, mealId);
      setMeals(updated);
      showToast('Meal removed from log');
    }
  };

  // Clear meals for selected date
  const handleClearDateMeals = () => {
    if (dateMeals.length === 0) {
      showToast('No meals logged for this day');
      return;
    }

    if (
      window.confirm(
        `Clear all ${dateMeals.length} meal(s) logged for ${selectedDate} on this profile?`
      )
    ) {
      const updated = clearMealsForUserAndDate(activeUserId, selectedDate);
      setMeals(updated);
      showToast(`Cleared meals for ${selectedDate}`);
    }
  };

  // Save custom manual targets
  const handleSaveTargets = (newTargets: DailyTargets) => {
    if (activeAccount) {
      const updated: UserAccount = {
        ...activeAccount,
        targets: newTargets,
        updatedAt: new Date().toISOString(),
      };
      handleUpdateAccount(updated);
    }
  };

  const handleQuickAction = (tab: 'photo' | 'text' | 'manual') => {
    setTrackerTab(tab);
    scrollToTracker();
  };

  return (
    <div className="min-h-screen bg-[#F5F6F1] text-[#11140F] flex flex-col font-sans selection:bg-[#C8F169] selection:text-[#11140F]">
      {/* Navigation Header */}
      <Header
        onOpenGoals={() => setIsGoalsModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
        onScrollToTracker={scrollToTracker}
        onScrollToDashboard={scrollToDashboard}
        activeProfileName={activeAccount?.name || 'My Profile'}
      />

      <main className="flex-1">
        {/* Hero Section with Live Snapshot */}
        <HeroSection
          todayMeals={todayMeals}
          targets={activeTargets}
          onTrackClick={scrollToTracker}
          onHowClick={() => {
            document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenQuiz={() => setIsProfileModalOpen(true)}
        />

        {/* Tracker Section (Main Work Area) */}
        <section
          ref={trackerSectionRef}
          id="tracker"
          className="bg-[#ECEFE7] py-14 sm:py-20 border-y border-[#E5E8DF]"
        >
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 border border-[#DCE2D1] bg-white px-3 py-1.5 rounded-full text-[#4F5D3E] text-xs font-black tracking-wide shadow-2xs mb-3">
                <span className="w-2 h-2 rounded-full bg-[#8FB83F]" />
                <span>YOUR DAILY TRACKER</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-[900] tracking-[-0.05em] text-[#11140F] m-0 mb-3 leading-tight font-heading">
                From meal to numbers.<br />In a few taps.
              </h2>
              <p className="text-[#858B80] text-sm sm:text-base leading-relaxed m-0">
                Describe what you ate or select a food photo. Review the AI estimate, adjust portions, and keep your running totals accurate.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-8 items-start">
              {/* Left Column: Context & Guiding Principles */}
              <div className="space-y-6">
                <div className="bg-white border border-[#E5E8DF] rounded-[24px] p-6 shadow-sm">
                  <div className="inline-block text-[11px] font-extrabold text-[#4F5D3E] bg-[#EFF5E2] px-2.5 py-1 rounded-full mb-3 uppercase tracking-wider">
                    {activeAccount?.name || 'Personalized'} Targets
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#11140F] tracking-tight leading-tight m-0 mb-2.5 font-heading">
                    Track your food, not every little complication.
                  </h3>
                  <p className="text-[#858B80] text-xs sm:text-sm leading-relaxed m-0 mb-4">
                    Home-cooked meals count too. Start with foods you know, make a fast estimate, and build a clearer picture of your day.
                  </p>

                  <ul className="space-y-2.5 m-0 p-0 list-none text-xs sm:text-sm text-[#11140F]">
                    <li className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#DCEBBD] text-[#3D5218] grid place-items-center text-xs font-black shrink-0">
                        ✓
                      </span>
                      <span>Target: {activeTargets.calories.toLocaleString()} kcal · {activeTargets.protein}g protein</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#DCEBBD] text-[#3D5218] grid place-items-center text-xs font-black shrink-0">
                        ✓
                      </span>
                      <span>Daily Water Goal: {activeTargets.waterMl || 2500} ml (~{Math.round((activeTargets.waterMl || 2500) / 250)} glasses)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#DCEBBD] text-[#3D5218] grid place-items-center text-xs font-black shrink-0">
                        ✓
                      </span>
                      <span>Gemini Vision photo scanner & natural-language text entry</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#DCEBBD] text-[#3D5218] grid place-items-center text-xs font-black shrink-0">
                        ✓
                      </span>
                      <span>Pakistani & regional dish intelligence (roti, biryani, daal, chai)</span>
                    </li>
                  </ul>
                </div>

                {/* Educational Note */}
                <div className="bg-[#FAFBF8] border border-[#DFE3D9] rounded-2xl p-4 text-xs text-[#858B80] leading-relaxed">
                  <strong className="text-[#11140F] block mb-1">
                    Nutritional Wisdom:
                  </strong>
                  Nutrient counts vary with portion size, cooking oil, sauces, and recipe specifics. Review assumptions and feel free to adjust values.
                </div>
              </div>

              {/* Right Column: Interactive Meal Tracker Form */}
              <div>
                <MealTracker
                  onAnalysisSuccess={handleAnalysisSuccess}
                  onDirectLog={handleSaveMeal}
                  onShowToast={showToast}
                  selectedTab={trackerTab}
                  onTabChange={setTrackerTab}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard & History Section */}
        <section
          ref={dashboardSectionRef}
          id="dashboard"
          className="max-w-[1180px] mx-auto px-4 sm:px-6 py-14 sm:py-20"
        >
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 border border-[#DCE2D1] bg-white px-3 py-1.5 rounded-full text-[#4F5D3E] text-xs font-black tracking-wide shadow-2xs mb-3">
              <span className="w-2 h-2 rounded-full bg-[#8FB83F]" />
              <span>DAILY INTAKE & HYDRATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-[900] tracking-[-0.05em] text-[#11140F] m-0 mb-3 font-heading">
              Your Daily Running Totals
            </h2>
            <p className="text-[#858B80] text-sm sm:text-base leading-relaxed m-0">
              Track progress against your personal targets, log daily hydration, and view weekly summary reports.
            </p>
          </div>

          <DailyDashboard
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            meals={dateMeals}
            targets={activeTargets}
            past7Days={past7Days}
            onDeleteMeal={handleDeleteMeal}
            onEditMeal={handleEditMeal}
            onClearDateMeals={handleClearDateMeals}
            onQuickAction={handleQuickAction}
            userName={activeAccount?.name || 'My Profile'}
            userId={activeUserId}
            waterMl={waterMl}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
            onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
          />
        </section>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Approach & CTA */}
        <ApproachSection onScrollToTracker={scrollToTracker} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Confirmation & Review Modal */}
      {reviewData && (
        <MealReviewModal
          initialResult={reviewData.result}
          initialMealType={reviewData.mealType}
          initialMealName={reviewData.mealName}
          photoPreviewUrl={reviewData.photoPreviewUrl}
          onSaveMeal={handleSaveMeal}
          onClose={() => setReviewData(null)}
        />
      )}

      {/* User Profile, Multi-user Switcher & Target Recalculator */}
      {isProfileModalOpen && activeAccount && (
        <UserProfileModal
          activeAccount={activeAccount}
          allAccounts={allAccounts}
          onSwitchAccount={handleSwitchAccount}
          onUpdateAccount={handleUpdateAccount}
          onAddNewProfile={handleAddNewProfile}
          onDeleteAccount={handleDeleteAccount}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Nutrition Goals Configuration Modal */}
      {isGoalsModalOpen && (
        <NutritionGoalsModal
          currentTargets={activeTargets}
          onSaveTargets={handleSaveTargets}
          onClose={() => setIsGoalsModalOpen(false)}
          onOpenQuiz={() => {
            setIsGoalsModalOpen(false);
            setIsProfileModalOpen(true);
          }}
        />
      )}

      {/* Weekly Summary Report Modal */}
      {isWeeklyReportOpen && (
        <WeeklyReportModal
          userId={activeUserId}
          userName={activeAccount?.name || 'My Profile'}
          targets={activeTargets}
          onClose={() => setIsWeeklyReportOpen(false)}
        />
      )}

      {/* Master Personalized Onboarding Flow */}
      {isOnboardingOpen && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onCancel={allAccounts.length > 0 ? () => setIsOnboardingOpen(false) : undefined}
          isAddingProfile={isAddingNewProfile}
        />
      )}

      {/* Launch Splash Screen */}
      {showSplash && <LoadingScreen onFinish={handleSplashFinish} />}

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
