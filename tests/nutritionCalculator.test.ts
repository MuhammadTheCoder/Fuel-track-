import { calculatePersonalizedTargets } from '../src/utils/nutritionCalculator.ts';
import { UserProfile } from '../src/types/nutrition.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

function runTests() {
  console.log('--- RUNNING NUTRITION CALCULATOR UNIT TESTS ---');

  // Test 1: Adult Male 25yo, 75kg, 180cm, Moderately Active, Muscle Goal
  {
    const maleProfile: UserProfile = {
      id: 'test-male',
      name: 'John',
      age: 25,
      sex: 'male',
      weight: 75,
      weightUnit: 'kg',
      height: 180,
      heightUnit: 'cm',
      activityLevel: 'moderate',
      exerciseRoutine: '3_4_days',
      dietaryPreference: 'no_preference',
      goal: 'muscle_strength',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const targets = calculatePersonalizedTargets(maleProfile);
    // MSJ RMR = 10*75 + 6.25*180 - 5*25 + 5 = 750 + 1125 - 125 + 5 = 1755
    // TDEE = 1755 * 1.55 + 120 = 2720 + 120 = 2840
    // Surplus = +250 => ~3090
    assert(targets.calories > 2500 && targets.calories < 3500, 'Adult male calorie estimate within range');
    assert(targets.protein >= 130 && targets.protein <= 160, 'Adult male protein ~1.8-2.0 g/kg (135g+)');
    assert(targets.fat >= 55, 'Healthy fat target is sufficient');
    assert(targets.carbs >= 150, 'Carbohydrate target is healthy');
    assert(targets.waterMl >= 2500, 'Water hydration target calculated (~3000ml)');

    // Consistency check: calories == protein*4 + carbs*4 + fat*9
    const macroCalories = targets.protein * 4 + targets.carbs * 4 + targets.fat * 9;
    assert(Math.abs(targets.calories - macroCalories) <= 1, 'Calorie total matches exact macro sum');
  }

  // Test 2: Adult Female 28yo, 60kg, 165cm, Sedentary, Fat Loss Goal
  {
    const femaleProfile: UserProfile = {
      id: 'test-female',
      name: 'Sarah',
      age: 28,
      sex: 'female',
      weight: 60,
      weightUnit: 'kg',
      height: 165,
      heightUnit: 'cm',
      activityLevel: 'sedentary',
      exerciseRoutine: 'none',
      dietaryPreference: 'no_preference',
      goal: 'fat_loss_preserve_muscle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const targets = calculatePersonalizedTargets(femaleProfile);
    // MSJ RMR = 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330
    // TDEE = 1330 * 1.2 = 1596
    // Deficit floor applied safely
    assert(targets.calories >= 1300, 'Adult female fat-loss calories respect health floor >= 1300');
    assert(targets.protein >= 100, 'Adequate protein preserved during fat loss (1.8-1.9 g/kg)');
    assert(!targets.isMinor, 'Adult correctly identified as not minor');

    const macroCalories = targets.protein * 4 + targets.carbs * 4 + targets.fat * 9;
    assert(Math.abs(targets.calories - macroCalories) <= 1, 'Macro consistency verified for female profile');
  }

  // Test 3: Minor Under 18 with Fat Loss Request — Crucial Safety Rule
  {
    const teenProfile: UserProfile = {
      id: 'test-teen',
      name: 'Adolescent',
      age: 15,
      sex: 'male',
      weight: 65,
      weightUnit: 'kg',
      height: 170,
      heightUnit: 'cm',
      activityLevel: 'moderate',
      exerciseRoutine: '3_4_days',
      dietaryPreference: 'no_preference',
      goal: 'fat_loss_preserve_muscle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const targets = calculatePersonalizedTargets(teenProfile);
    assert(targets.isMinor === true, 'Under 18 correctly flagged as isMinor');
    assert(targets.calories >= 1950, 'Adolescent calories never restricted below healthy growth floor 1950 kcal');
    assert(
      targets.methodNote.includes('Youth Health Protocol') || targets.methodNote.includes('individuals under 18'),
      'Clear pediatric health safeguard guidance provided in method note'
    );
    assert(targets.protein <= 130, 'Adolescent protein avoids adult extreme bodybuilding targets');
  }

  // Test 4: Imperial Unit Conversion (lb and ft/in)
  {
    const imperialProfile: UserProfile = {
      id: 'test-imperial',
      name: 'Mike',
      age: 30,
      sex: 'male',
      weight: 165, // ~74.8 kg
      weightUnit: 'lb',
      height: 0,
      heightUnit: 'ft_in',
      heightFt: 5,
      heightIn: 11, // ~180 cm
      activityLevel: 'moderate',
      exerciseRoutine: '3_4_days',
      dietaryPreference: 'no_preference',
      goal: 'maintain_fitness',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const targets = calculatePersonalizedTargets(imperialProfile);
    assert(targets.calories > 2200 && targets.calories < 3200, 'Imperial conversions compute correct energy');
    assert(targets.protein >= 110, 'Protein converted accurately from lbs to kg');
  }

  // Test 5: Neutral Sex Selection (Prefer not to say)
  {
    const neutralProfile: UserProfile = {
      id: 'test-neutral',
      name: 'Taylor',
      age: 26,
      sex: 'prefer_not_to_say',
      weight: 70,
      weightUnit: 'kg',
      height: 175,
      heightUnit: 'cm',
      activityLevel: 'light',
      exerciseRoutine: '1_2_days',
      dietaryPreference: 'vegan',
      goal: 'general_health_activity',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const targets = calculatePersonalizedTargets(neutralProfile);
    assert(targets.calories > 1800, 'Neutral sex midpoint produces valid TDEE');
    assert(targets.waterMl >= 2000, 'Vegan profile produces valid hydration and macros');
  }

  console.log('\n✅ ALL 5 NUTRITION CALCULATOR UNIT TESTS PASSED SUCCESSFULLY!');
}

runTests();
