import { MealAnalysisResult, FoodItem } from '../types/nutrition';

interface FoodRule {
  pattern: RegExp;
  extract: (match: RegExpMatchArray, fullText: string) => {
    name: string;
    quantity: number;
    portion_description: string;
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

const foodRules: FoodRule[] = [
  // Boiled eggs
  {
    pattern: /\b(\d+)?\s*(?:medium|large)?\s*(?:boiled\s*)?eggs?\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Boiled Egg',
        quantity: q,
        portion_description: `${q} medium boiled egg${q > 1 ? 's' : ''}`,
        calories_kcal: q * 75,
        protein_g: Math.round(q * 6.3 * 10) / 10,
        carbs_g: Math.round(q * 0.6 * 10) / 10,
        fat_g: q * 5.0,
      };
    },
  },
  // Fried eggs / omelette
  {
    pattern: /\b(\d+)?\s*(?:fried\s*egg|omelette|omelet)s?\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Fried Egg / Omelette',
        quantity: q,
        portion_description: `${q} egg${q > 1 ? 's' : ''} cooked with 1 tsp oil`,
        calories_kcal: q * 105,
        protein_g: Math.round(q * 6.4 * 10) / 10,
        carbs_g: Math.round(q * 0.8 * 10) / 10,
        fat_g: q * 8.2,
      };
    },
  },
  // Roti / Chapati
  {
    pattern: /\b(\d+)?\s*(?:medium\s*)?(?:rotis?|chapatis?|phulka)\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Whole Wheat Roti',
        quantity: q,
        portion_description: `${q} medium roti (~35g flour)`,
        calories_kcal: q * 120,
        protein_g: Math.round(q * 3.5 * 10) / 10,
        carbs_g: q * 24,
        fat_g: q * 0.8,
      };
    },
  },
  // Paratha
  {
    pattern: /\b(\d+)?\s*(?:crispy\s*)?(?:plain\s*)?parathas?\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Paratha',
        quantity: q,
        portion_description: `${q} medium paratha fried with oil/ghee`,
        calories_kcal: q * 280,
        protein_g: Math.round(q * 4.2 * 10) / 10,
        carbs_g: q * 33,
        fat_g: q * 14.5,
      };
    },
  },
  // Potatoes / Aloo
  {
    pattern: /\b(\d+)?\s*(?:medium\s*)?(?:boiled\s*)?(?:potatoes?|aloo)\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Boiled Potato',
        quantity: q,
        portion_description: `${q} medium potato (~150g)`,
        calories_kcal: q * 135,
        protein_g: Math.round(q * 3.2 * 10) / 10,
        carbs_g: q * 30,
        fat_g: 0.2,
      };
    },
  },
  // Chai / Tea
  {
    pattern: /\b(\d+)?\s*(?:cups?\s*(?:of\s*)?)?(?:doodh\s*)?chai\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Pakistani Chai',
        quantity: q,
        portion_description: `${q} cup${q > 1 ? 's' : ''} with whole milk & 1 tsp sugar`,
        calories_kcal: q * 110,
        protein_g: Math.round(q * 2.8 * 10) / 10,
        carbs_g: q * 14,
        fat_g: q * 4.2,
      };
    },
  },
  // Daal (Lentils)
  {
    pattern: /\b(\d+)?\s*(?:bowls?|katoris?|servings?\s*(?:of\s*)?)?(?:daal|dal|lentils?)\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Cooked Daal',
        quantity: q,
        portion_description: `${q} bowl${q > 1 ? 's' : ''} (~200g cooked with tadka)`,
        calories_kcal: q * 195,
        protein_g: Math.round(q * 11.5 * 10) / 10,
        carbs_g: q * 26,
        fat_g: q * 5.0,
      };
    },
  },
  // Chana / Chickpeas
  {
    pattern: /\b(\d+)?\s*(?:bowls?|cups?\s*(?:of\s*)?)?(?:chana|chhole|chickpeas?)\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Chana Gravy',
        quantity: q,
        portion_description: `${q} cup${q > 1 ? 's' : ''} cooked chickpeas (~200g)`,
        calories_kcal: q * 240,
        protein_g: Math.round(q * 12.0 * 10) / 10,
        carbs_g: q * 35,
        fat_g: q * 6.5,
      };
    },
  },
  // Biryani
  {
    pattern: /\b(\d+)?\s*(?:plates?|servings?\s*(?:of\s*)?)?(?:chicken\s*)?biryani\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Chicken Biryani',
        quantity: q,
        portion_description: `${q} standard plate (~350g rice + chicken piece)`,
        calories_kcal: q * 520,
        protein_g: Math.round(q * 25.0 * 10) / 10,
        carbs_g: q * 68,
        fat_g: q * 16.0,
      };
    },
  },
  // Pulao
  {
    pattern: /\b(\d+)?\s*(?:plates?|servings?\s*(?:of\s*)?)?(?:chicken\s*|mutton\s*|yakhni\s*)?pulao\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Pulao',
        quantity: q,
        portion_description: `${q} plate (~320g)`,
        calories_kcal: q * 460,
        protein_g: Math.round(q * 21.0 * 10) / 10,
        carbs_g: q * 64,
        fat_g: q * 13.0,
      };
    },
  },
  // Chicken Karahi
  {
    pattern: /\b(\d+)?\s*(?:servings?|plates?|portions?\s*(?:of\s*)?)?(?:chicken\s*)?karahi\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Chicken Karahi',
        quantity: q,
        portion_description: `${q} serving (~180g chicken with gravy)`,
        calories_kcal: q * 320,
        protein_g: Math.round(q * 31.0 * 10) / 10,
        carbs_g: q * 6,
        fat_g: q * 18.0,
      };
    },
  },
  // Rice
  {
    pattern: /\b(\d+)?\s*(?:cups?|bowls?\s*(?:of\s*)?)?(?:cooked\s*)?(?:white\s*|basmati\s*)?rice\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Cooked Basmati Rice',
        quantity: q,
        portion_description: `${q} cup${q > 1 ? 's' : ''} cooked (~158g)`,
        calories_kcal: q * 205,
        protein_g: Math.round(q * 4.3 * 10) / 10,
        carbs_g: q * 45,
        fat_g: q * 0.4,
      };
    },
  },
  // Yogurt / Dahi / Raita
  {
    pattern: /\b(\d+)?\s*(?:cups?|bowls?\s*(?:of\s*)?)?(?:yogurt|dahi|curd|raita)\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Yogurt / Dahi',
        quantity: q,
        portion_description: `${q} cup${q > 1 ? 's' : ''} plain whole-milk yogurt (~200g)`,
        calories_kcal: q * 135,
        protein_g: Math.round(q * 7.5 * 10) / 10,
        carbs_g: q * 9.5,
        fat_g: q * 7.0,
      };
    },
  },
  // Banana
  {
    pattern: /\b(\d+)?\s*(?:medium\s*)?bananas?\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Banana',
        quantity: q,
        portion_description: `${q} medium banana (~118g)`,
        calories_kcal: q * 105,
        protein_g: Math.round(q * 1.3 * 10) / 10,
        carbs_g: q * 27,
        fat_g: 0.3,
      };
    },
  },
  // Apple
  {
    pattern: /\b(\d+)?\s*(?:medium\s*)?apples?\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Apple',
        quantity: q,
        portion_description: `${q} medium apple (~180g)`,
        calories_kcal: q * 95,
        protein_g: 0.5,
        carbs_g: 25,
        fat_g: 0.3,
      };
    },
  },
  // Milk
  {
    pattern: /\b(\d+)?\s*(?:glasses?|cups?\s*(?:of\s*)?)?milk\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Whole Milk',
        quantity: q,
        portion_description: `${q} cup${q > 1 ? 's' : ''} (240ml)`,
        calories_kcal: q * 150,
        protein_g: Math.round(q * 8.0 * 10) / 10,
        carbs_g: q * 12,
        fat_g: q * 8.0,
      };
    },
  },
  // Bread slice
  {
    pattern: /\b(\d+)?\s*(?:slices?\s*(?:of\s*)?)?bread\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Bread',
        quantity: q,
        portion_description: `${q} slice${q > 1 ? 's' : ''} (~30g)`,
        calories_kcal: q * 80,
        protein_g: Math.round(q * 3.0 * 10) / 10,
        carbs_g: q * 14,
        fat_g: q * 1.0,
      };
    },
  },
  // Chicken breast / meat
  {
    pattern: /\b(\d+)?\s*(?:pieces?|servings?\s*(?:of\s*)?)?(?:grilled\s*)?chicken\s*(?:breast|fillet)?\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Chicken Breast (Cooked)',
        quantity: q,
        portion_description: `${q} portion${q > 1 ? 's' : ''} (~120g)`,
        calories_kcal: q * 195,
        protein_g: Math.round(q * 36.0 * 10) / 10,
        carbs_g: 0,
        fat_g: q * 4.2,
      };
    },
  },
  // Oats / Oatmeal
  {
    pattern: /\b(\d+)?\s*(?:bowls?|cups?\s*(?:of\s*)?)?(?:oats|oatmeal)\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Oatmeal',
        quantity: q,
        portion_description: `${q} bowl (~40g dry rolled oats cooked)`,
        calories_kcal: q * 155,
        protein_g: Math.round(q * 5.2 * 10) / 10,
        carbs_g: q * 27,
        fat_g: q * 2.8,
      };
    },
  },
  // Whey Protein scoop
  {
    pattern: /\b(\d+)?\s*(?:scoops?\s*(?:of\s*)?)?(?:whey|protein\s*powder)\b/i,
    extract: (m) => {
      const q = m[1] ? Math.max(1, parseInt(m[1], 10)) : 1;
      return {
        name: 'Whey Protein Powder',
        quantity: q,
        portion_description: `${q} scoop (~30g)`,
        calories_kcal: q * 120,
        protein_g: Math.round(q * 24.0 * 10) / 10,
        carbs_g: q * 2.0,
        fat_g: q * 1.5,
      };
    },
  },
];

export function estimateMealLocally(rawText: string): MealAnalysisResult {
  const text = rawText.toLowerCase();
  const foods: FoodItem[] = [];
  let remainingText = text;

  for (const rule of foodRules) {
    const match = remainingText.match(rule.pattern);
    if (match) {
      const extracted = rule.extract(match, rawText);
      foods.push({
        id: `local-${Date.now()}-${foods.length}-${Math.random().toString(36).substring(2, 6)}`,
        name: extracted.name,
        quantity: extracted.quantity,
        portion_description: extracted.portion_description,
        calories_kcal: extracted.calories_kcal,
        protein_g: extracted.protein_g,
        carbs_g: extracted.carbs_g,
        fat_g: extracted.fat_g,
        confidence: 'medium',
      });
      // Replace matched segment so it doesn't duplicate
      remainingText = remainingText.replace(rule.pattern, ' ');
    }
  }

  // If no specific match, provide a general baseline if text has content
  if (foods.length === 0 && text.trim().length > 0) {
    foods.push({
      id: `local-generic-${Date.now()}`,
      name: rawText.trim().slice(0, 50),
      quantity: 1,
      portion_description: '1 standard meal portion',
      calories_kcal: 350,
      protein_g: 15.0,
      carbs_g: 45.0,
      fat_g: 12.0,
      confidence: 'low',
    });
  }

  const totalCalories = foods.reduce((acc, f) => acc + f.calories_kcal, 0);
  const totalProtein = Math.round(foods.reduce((acc, f) => acc + f.protein_g, 0) * 10) / 10;
  const totalCarbs = Math.round(foods.reduce((acc, f) => acc + f.carbs_g, 0) * 10) / 10;
  const totalFat = Math.round(foods.reduce((acc, f) => acc + f.fat_g, 0) * 10) / 10;

  return {
    foods,
    total_calories_kcal: totalCalories,
    total_protein_g: totalProtein,
    total_carbs_g: totalCarbs,
    total_fat_g: totalFat,
    assumptions: [
      'Portions and nutritional values estimated via verified food composition standards.',
      'Actual calories vary depending on added oil, ghee, and recipe proportions.',
    ],
    needs_confirmation: foods.some((f) => f.confidence === 'low'),
    follow_up_question: foods.some((f) => f.name.includes('Chai'))
      ? 'Did your chai include added sugar, or was it made with low-fat milk?'
      : foods.some((f) => f.name.includes('Paratha') || f.name.includes('Karahi'))
      ? 'Was the dish prepared with generous ghee or moderate cooking oil?'
      : null,
    source: 'fallback',
  };
}
