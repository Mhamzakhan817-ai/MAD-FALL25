import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Initialize the app with sample data for testing
export const initializeApp = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if foods already exist
    const existingFoods = await ctx.db.query("foods").take(1);
    if (existingFoods.length > 0) {
      return { message: "App already initialized" };
    }

    // Add comprehensive sample foods with anti-inflammatory scores
    const sampleFoods = [
      // High anti-inflammatory foods (8-10)
      {
        name: "Wild Salmon",
        brand: "Fresh",
        caloriesPer100g: 208,
        proteinPer100g: 25.4,
        carbsPer100g: 0,
        fatPer100g: 12.4,
        fiberPer100g: 0,
        sugarPer100g: 0,
        antiInflammatoryScore: 9.5,
        commonServings: [
          { name: "1 fillet (150g)", grams: 150 },
          { name: "1 serving (100g)", grams: 100 },
          { name: "3 oz (85g)", grams: 85 },
        ],
      },
      {
        name: "Blueberries",
        caloriesPer100g: 57,
        proteinPer100g: 0.7,
        carbsPer100g: 14.5,
        fatPer100g: 0.3,
        fiberPer100g: 2.4,
        sugarPer100g: 10,
        antiInflammatoryScore: 9.0,
        commonServings: [
          { name: "1 cup (148g)", grams: 148 },
          { name: "1/2 cup (74g)", grams: 74 },
          { name: "1 handful (30g)", grams: 30 },
        ],
      },
      {
        name: "Spinach",
        caloriesPer100g: 23,
        proteinPer100g: 2.9,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        fiberPer100g: 2.2,
        sugarPer100g: 0.4,
        antiInflammatoryScore: 8.8,
        commonServings: [
          { name: "1 cup raw (30g)", grams: 30 },
          { name: "1 cup cooked (180g)", grams: 180 },
          { name: "2 cups raw (60g)", grams: 60 },
        ],
      },
      {
        name: "Turmeric",
        caloriesPer100g: 354,
        proteinPer100g: 7.8,
        carbsPer100g: 64.9,
        fatPer100g: 9.9,
        fiberPer100g: 21,
        sugarPer100g: 3.2,
        antiInflammatoryScore: 10,
        commonServings: [
          { name: "1 tsp (2g)", grams: 2 },
          { name: "1 tbsp (7g)", grams: 7 },
          { name: "1/2 tsp (1g)", grams: 1 },
        ],
      },
      {
        name: "Walnuts",
        caloriesPer100g: 654,
        proteinPer100g: 15.2,
        carbsPer100g: 13.7,
        fatPer100g: 65.2,
        fiberPer100g: 6.7,
        sugarPer100g: 2.6,
        antiInflammatoryScore: 8.5,
        commonServings: [
          { name: "1 oz (28g)", grams: 28 },
          { name: "1/4 cup (30g)", grams: 30 },
          { name: "1 handful (15g)", grams: 15 },
        ],
      },
      {
        name: "Avocado",
        caloriesPer100g: 160,
        proteinPer100g: 2,
        carbsPer100g: 8.5,
        fatPer100g: 14.7,
        fiberPer100g: 6.7,
        sugarPer100g: 0.7,
        antiInflammatoryScore: 8.2,
        commonServings: [
          { name: "1 medium (150g)", grams: 150 },
          { name: "1/2 medium (75g)", grams: 75 },
          { name: "1 slice (30g)", grams: 30 },
        ],
      },
      // Moderate anti-inflammatory foods (5-7)
      {
        name: "Chicken Breast",
        brand: "Skinless",
        caloriesPer100g: 165,
        proteinPer100g: 31,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        fiberPer100g: 0,
        sugarPer100g: 0,
        antiInflammatoryScore: 6.5,
        commonServings: [
          { name: "1 breast (150g)", grams: 150 },
          { name: "3 oz (85g)", grams: 85 },
          { name: "4 oz (113g)", grams: 113 },
        ],
      },
      {
        name: "Brown Rice",
        caloriesPer100g: 111,
        proteinPer100g: 2.6,
        carbsPer100g: 23,
        fatPer100g: 0.9,
        fiberPer100g: 1.8,
        sugarPer100g: 0.4,
        antiInflammatoryScore: 6.0,
        commonServings: [
          { name: "1 cup cooked (195g)", grams: 195 },
          { name: "1/2 cup cooked (98g)", grams: 98 },
          { name: "1/3 cup cooked (65g)", grams: 65 },
        ],
      },
      {
        name: "Sweet Potato",
        caloriesPer100g: 86,
        proteinPer100g: 1.6,
        carbsPer100g: 20.1,
        fatPer100g: 0.1,
        fiberPer100g: 3,
        sugarPer100g: 4.2,
        antiInflammatoryScore: 7.2,
        commonServings: [
          { name: "1 medium (128g)", grams: 128 },
          { name: "1 cup cubed (133g)", grams: 133 },
          { name: "1/2 medium (64g)", grams: 64 },
        ],
      },
      // Lower anti-inflammatory foods (2-4)
      {
        name: "White Bread",
        brand: "Generic",
        caloriesPer100g: 265,
        proteinPer100g: 9,
        carbsPer100g: 49,
        fatPer100g: 3.2,
        fiberPer100g: 2.7,
        sugarPer100g: 5.7,
        antiInflammatoryScore: 3.0,
        commonServings: [
          { name: "1 slice (28g)", grams: 28 },
          { name: "2 slices (56g)", grams: 56 },
          { name: "1 thick slice (35g)", grams: 35 },
        ],
      },
      {
        name: "French Fries",
        brand: "Fast Food",
        caloriesPer100g: 365,
        proteinPer100g: 4,
        carbsPer100g: 63,
        fatPer100g: 17,
        fiberPer100g: 3.8,
        sugarPer100g: 0.3,
        antiInflammatoryScore: 2.0,
        commonServings: [
          { name: "Small order (75g)", grams: 75 },
          { name: "Medium order (115g)", grams: 115 },
          { name: "Large order (150g)", grams: 150 },
        ],
      },
      {
        name: "Soda",
        brand: "Cola",
        caloriesPer100g: 42,
        proteinPer100g: 0,
        carbsPer100g: 10.6,
        fatPer100g: 0,
        fiberPer100g: 0,
        sugarPer100g: 10.6,
        antiInflammatoryScore: 1.5,
        commonServings: [
          { name: "1 can (355ml)", grams: 355 },
          { name: "1 bottle (500ml)", grams: 500 },
          { name: "1 cup (240ml)", grams: 240 },
        ],
      },
      // Additional healthy options
      {
        name: "Greek Yogurt",
        brand: "Plain",
        caloriesPer100g: 59,
        proteinPer100g: 10,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        fiberPer100g: 0,
        sugarPer100g: 3.6,
        antiInflammatoryScore: 7.5,
        commonServings: [
          { name: "1 cup (245g)", grams: 245 },
          { name: "1/2 cup (123g)", grams: 123 },
          { name: "1 container (170g)", grams: 170 },
        ],
      },
      {
        name: "Broccoli",
        caloriesPer100g: 34,
        proteinPer100g: 2.8,
        carbsPer100g: 7,
        fatPer100g: 0.4,
        fiberPer100g: 2.6,
        sugarPer100g: 1.5,
        antiInflammatoryScore: 8.0,
        commonServings: [
          { name: "1 cup chopped (91g)", grams: 91 },
          { name: "1 medium stalk (148g)", grams: 148 },
          { name: "1/2 cup (44g)", grams: 44 },
        ],
      },
      {
        name: "Olive Oil",
        brand: "Extra Virgin",
        caloriesPer100g: 884,
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 100,
        fiberPer100g: 0,
        sugarPer100g: 0,
        antiInflammatoryScore: 9.2,
        commonServings: [
          { name: "1 tbsp (14g)", grams: 14 },
          { name: "1 tsp (5g)", grams: 5 },
          { name: "2 tbsp (28g)", grams: 28 },
        ],
      },
    ];

    // Insert all sample foods
    for (const food of sampleFoods) {
      await ctx.db.insert("foods", food);
    }

    return { 
      message: "App initialized successfully", 
      foodsAdded: sampleFoods.length 
    };
  },
});

// Initialize supplements with sample data
export const initializeSupplements = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if supplements already exist
    const existingSupplements = await ctx.db.query("supplements").take(1);
    if (existingSupplements.length > 0) {
      return { message: "Supplements already initialized" };
    }

    // Add comprehensive sample supplements
    const sampleSupplements = [
      {
        title: "Turmeric Curcumin Complex",
        description: "High-potency turmeric extract with black pepper for enhanced absorption. One of nature's most powerful anti-inflammatory compounds.",
        category: "herbal",
        price: 2999, // $29.99
        antiInflammatoryScore: 9.5,
        benefits: [
          "Reduces joint pain and stiffness",
          "Supports cardiovascular health",
          "Enhances brain function and memory",
          "Powerful antioxidant properties",
          "May help reduce chronic inflammation markers",
          "Supports digestive health"
        ],
        dosageRecommendation: "500-1000mg daily with meals, preferably with black pepper extract (piperine) for enhanced absorption",
        scientificEvidence: "Over 3,000 published studies support turmeric's anti-inflammatory effects. Clinical trials show significant reduction in inflammatory markers like CRP and IL-6.",
        potentialSideEffects: [
          "May increase bleeding risk when combined with blood thinners",
          "Can cause stomach upset in sensitive individuals",
          "May interact with diabetes medications"
        ],
        interactions: [
          "Blood thinning medications (warfarin, aspirin)",
          "Diabetes medications",
          "Iron supplements (may reduce absorption)"
        ],
        qualityBrands: [
          "Thorne Meriva SF",
          "Life Extension Super Bio-Curcumin",
          "Doctor's Best Curcumin Phytosome"
        ],
        featured: true,
      },
      {
        title: "Omega-3 Fish Oil (EPA/DHA)",
        description: "Premium fish oil concentrate providing essential omega-3 fatty acids EPA and DHA for comprehensive anti-inflammatory support.",
        category: "omega-3",
        price: 3499, // $34.99
        antiInflammatoryScore: 9.0,
        benefits: [
          "Reduces systemic inflammation",
          "Supports heart and brain health",
          "Improves joint mobility",
          "Enhances mood and cognitive function",
          "Supports healthy skin",
          "May reduce risk of chronic diseases"
        ],
        dosageRecommendation: "1-3g daily of combined EPA/DHA, preferably with meals. Higher EPA ratios for inflammation, higher DHA for brain health.",
        scientificEvidence: "Extensive research shows omega-3s reduce inflammatory markers and support cardiovascular health. Meta-analyses confirm anti-inflammatory benefits.",
        potentialSideEffects: [
          "Fishy aftertaste or burps",
          "May increase bleeding risk at high doses",
          "Digestive upset in some individuals"
        ],
        interactions: [
          "Blood thinning medications",
          "High doses may interact with immune-suppressing drugs"
        ],
        qualityBrands: [
          "Nordic Naturals Ultimate Omega",
          "Carlson Elite Omega-3 Gems",
          "Thorne Omega-3 with CoQ10"
        ],
        featured: true,
      },
      {
        title: "Probiotic Multi-Strain Complex",
        description: "Advanced probiotic formula with 15 clinically studied strains to support gut health and reduce systemic inflammation.",
        category: "probiotics",
        price: 4299, // $42.99
        antiInflammatoryScore: 8.5,
        benefits: [
          "Supports healthy gut microbiome",
          "Reduces intestinal inflammation",
          "Enhances immune system function",
          "May improve mood and mental clarity",
          "Supports nutrient absorption",
          "Helps maintain healthy weight"
        ],
        dosageRecommendation: "1-2 capsules daily on empty stomach, at least 30 minutes before meals. Store in refrigerator for maximum potency.",
        scientificEvidence: "Clinical studies show specific probiotic strains can reduce inflammatory markers and support immune function through the gut-brain axis.",
        potentialSideEffects: [
          "Initial digestive changes or bloating",
          "Rare risk of infection in immunocompromised individuals"
        ],
        interactions: [
          "Antibiotics (take 2-3 hours apart)",
          "Immunosuppressive medications"
        ],
        qualityBrands: [
          "Thorne FloraPro-LP",
          "Klaire Labs Ther-Biotic Complete",
          "Garden of Life Dr. Formulated Probiotics"
        ],
        featured: true,
      },
      {
        title: "Resveratrol & Quercetin Complex",
        description: "Powerful antioxidant combination featuring resveratrol and quercetin for cellular protection and anti-inflammatory support.",
        category: "antioxidants",
        price: 3799, // $37.99
        antiInflammatoryScore: 8.8,
        benefits: [
          "Powerful antioxidant protection",
          "Supports cardiovascular health",
          "May enhance longevity pathways",
          "Reduces oxidative stress",
          "Supports healthy aging",
          "Anti-inflammatory properties"
        ],
        dosageRecommendation: "250-500mg resveratrol with 500-1000mg quercetin daily, preferably with meals containing healthy fats for absorption.",
        scientificEvidence: "Research shows resveratrol activates longevity genes and reduces inflammation. Quercetin has strong anti-inflammatory and antioxidant properties.",
        potentialSideEffects: [
          "May cause digestive upset at high doses",
          "Potential interaction with blood thinners"
        ],
        interactions: [
          "Blood thinning medications",
          "May enhance effects of blood pressure medications"
        ],
        qualityBrands: [
          "Thorne ResveraCel",
          "Life Extension Optimized Resveratrol",
          "Doctor's Best Quercetin Bromelain"
        ],
        featured: false,
      },
      {
        title: "Boswellia Serrata Extract",
        description: "Standardized boswellia extract providing powerful boswellic acids for joint health and inflammation support.",
        category: "herbal",
        price: 2799, // $27.99
        antiInflammatoryScore: 8.7,
        benefits: [
          "Supports joint health and mobility",
          "Reduces inflammation in joints",
          "May help with respiratory health",
          "Supports healthy inflammatory response",
          "Traditional Ayurvedic medicine",
          "May improve exercise recovery"
        ],
        dosageRecommendation: "300-500mg of standardized extract (containing 65% boswellic acids) 2-3 times daily with meals.",
        scientificEvidence: "Clinical studies show boswellia can reduce joint pain and improve mobility. Contains compounds that inhibit inflammatory enzymes.",
        potentialSideEffects: [
          "Generally well tolerated",
          "Rare digestive upset",
          "May cause skin rash in sensitive individuals"
        ],
        interactions: [
          "May enhance effects of anti-inflammatory medications",
          "Potential interaction with immune-suppressing drugs"
        ],
        qualityBrands: [
          "Life Extension 5-LOX Inhibitor with AprèsFlex",
          "Doctor's Best Boswellia",
          "Thorne Boswellia Phytosome"
        ],
        featured: false,
      },
      {
        title: "Magnesium Glycinate Complex",
        description: "Highly bioavailable magnesium in glycinate form for optimal absorption and anti-inflammatory support.",
        category: "minerals",
        price: 2299, // $22.99
        antiInflammatoryScore: 7.5,
        benefits: [
          "Supports muscle and nerve function",
          "Promotes restful sleep",
          "Reduces inflammation markers",
          "Supports heart health",
          "May help with stress and anxiety",
          "Supports bone health"
        ],
        dosageRecommendation: "200-400mg daily, preferably in the evening. Start with lower dose and increase gradually to assess tolerance.",
        scientificEvidence: "Magnesium deficiency is linked to increased inflammation. Supplementation can reduce CRP and other inflammatory markers.",
        potentialSideEffects: [
          "Digestive upset or diarrhea at high doses",
          "Generally well tolerated in glycinate form"
        ],
        interactions: [
          "May reduce absorption of certain antibiotics",
          "Can enhance effects of blood pressure medications"
        ],
        qualityBrands: [
          "Thorne Magnesium Bisglycinate",
          "Doctor's Best High Absorption Magnesium",
          "Life Extension Magnesium Caps"
        ],
        featured: false,
      },
      // Add more supplements for different categories
      {
        title: "Vitamin D3 + K2 Complex",
        description: "Synergistic combination of vitamin D3 and K2 for immune support and anti-inflammatory benefits.",
        category: "vitamins",
        price: 2499, // $24.99
        antiInflammatoryScore: 8.2,
        benefits: [
          "Supports immune system function",
          "Reduces inflammatory markers",
          "Supports bone and heart health",
          "May improve mood and energy",
          "Enhances calcium absorption",
          "Supports muscle function"
        ],
        dosageRecommendation: "2000-4000 IU vitamin D3 with 100-200mcg K2 daily, preferably with meals containing fat.",
        scientificEvidence: "Vitamin D deficiency is linked to increased inflammation. Studies show D3 supplementation can reduce inflammatory cytokines.",
        potentialSideEffects: [
          "Generally well tolerated",
          "High doses may cause hypercalcemia"
        ],
        interactions: [
          "May enhance effects of calcium channel blockers",
          "Can interact with thiazide diuretics"
        ],
        qualityBrands: [
          "Thorne Vitamin D/K2",
          "Life Extension Super K with Advanced K2 Complex",
          "Doctor's Best Vitamin D3"
        ],
        featured: false,
      },
      {
        title: "Green Tea Extract (EGCG)",
        description: "Standardized green tea extract rich in EGCG for powerful antioxidant and anti-inflammatory support.",
        category: "antioxidants",
        price: 1999, // $19.99
        antiInflammatoryScore: 8.0,
        benefits: [
          "Powerful antioxidant protection",
          "Supports metabolic health",
          "May enhance fat burning",
          "Supports brain function",
          "Anti-inflammatory properties",
          "May support longevity"
        ],
        dosageRecommendation: "300-500mg EGCG daily, preferably between meals. Avoid taking with iron-rich foods.",
        scientificEvidence: "EGCG has been shown to reduce inflammatory markers and provide cellular protection against oxidative stress.",
        potentialSideEffects: [
          "May cause stomach upset on empty stomach",
          "Can reduce iron absorption",
          "High doses may affect liver function"
        ],
        interactions: [
          "May reduce iron absorption",
          "Can interact with blood thinning medications",
          "May enhance effects of stimulants"
        ],
        qualityBrands: [
          "Life Extension Mega Green Tea Extract",
          "Thorne Green Tea Phytosome",
          "Doctor's Best EGCG"
        ],
        featured: false,
      },
      {
        title: "Zinc Bisglycinate",
        description: "Highly bioavailable zinc in chelated form for immune support and anti-inflammatory benefits.",
        category: "minerals",
        price: 1799, // $17.99
        antiInflammatoryScore: 7.8,
        benefits: [
          "Supports immune system function",
          "Promotes wound healing",
          "Supports skin health",
          "Anti-inflammatory properties",
          "Supports protein synthesis",
          "May improve cognitive function"
        ],
        dosageRecommendation: "15-30mg daily with food to avoid stomach upset. Take away from calcium and iron supplements.",
        scientificEvidence: "Zinc deficiency is associated with increased inflammation. Supplementation can help normalize immune function and reduce inflammatory markers.",
        potentialSideEffects: [
          "May cause nausea on empty stomach",
          "High doses can interfere with copper absorption",
          "May cause metallic taste"
        ],
        interactions: [
          "Can reduce absorption of antibiotics",
          "May interfere with copper absorption",
          "Can interact with certain medications"
        ],
        qualityBrands: [
          "Thorne Zinc Bisglycinate",
          "Life Extension Zinc Caps",
          "Doctor's Best Chelated Zinc"
        ],
        featured: false,
      }
    ];

    // Insert all sample supplements
    for (const supplement of sampleSupplements) {
      await ctx.db.insert("supplements", supplement);
    }

    return { 
      message: "Supplements initialized successfully", 
      supplementsAdded: sampleSupplements.length 
    };
  },
});

// Initialize recipes and meal plans
export const initializeRecipes = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if recipes already exist
    const existingRecipes = await ctx.db.query("recipes").take(1);
    if (existingRecipes.length > 0) {
      return { message: "Recipes already initialized" };
    }

    // Create sample meal plan
    const mealPlanId = await ctx.db.insert("mealPlans", {
      title: "5 Day Anti-Inflammatory Reset",
      description: "A complete 5-day meal plan designed to reduce inflammation and boost energy. Includes breakfast, lunch, and dinner recipes with grocery list.",
      duration: 5,
      price: 1999, // $19.99
      antiInflammatoryFocus: true,
      difficulty: "easy",
      totalRecipes: 15,
      featured: true,
    });

    // Create sample recipes
    const sampleRecipes = [
      {
        title: "Turmeric-Ginger Chicken with Roasted Vegetables",
        description: "Anti-inflammatory powerhouse with golden turmeric, fresh ginger, and colorful roasted vegetables.",
        cookTime: 45,
        servings: 4,
        difficulty: "medium" as const,
        price: 599, // $5.99
        antiInflammatoryScore: 9.2,
        calories: 380,
        carbs: 25,
        protein: 35,
        fat: 18,
        ingredients: [
          "4 chicken breasts",
          "2 tsp turmeric powder",
          "1 inch fresh ginger, grated",
          "2 bell peppers, sliced",
          "1 zucchini, chopped",
          "2 tbsp olive oil",
          "1 tsp garlic powder",
          "Salt and pepper to taste",
          "1 lemon, juiced"
        ],
        instructions: [
          "Preheat oven to 425°F (220°C)",
          "Mix turmeric, ginger, garlic powder, salt, and pepper in a bowl",
          "Rub spice mixture on chicken breasts",
          "Toss vegetables with olive oil and remaining spices",
          "Place chicken and vegetables on baking sheet",
          "Roast for 25-30 minutes until chicken is cooked through",
          "Drizzle with lemon juice before serving"
        ],
        tags: ["dinner", "anti-inflammatory", "high-protein", "gluten-free"],
        featured: true,
        mealPlanId,
      },
      {
        title: "Breakfast Avocado Egg Toast",
        description: "Creamy avocado and perfectly poached egg on whole grain toast with anti-inflammatory spices.",
        cookTime: 15,
        servings: 1,
        difficulty: "easy" as const,
        price: 399, // $3.99
        antiInflammatoryScore: 8.5,
        calories: 320,
        carbs: 28,
        protein: 16,
        fat: 20,
        ingredients: [
          "2 slices whole grain bread",
          "1 ripe avocado",
          "2 eggs",
          "1 tsp olive oil",
          "Pinch of turmeric",
          "Red pepper flakes",
          "Salt and pepper",
          "Hemp seeds (optional)"
        ],
        instructions: [
          "Toast bread slices until golden",
          "Mash avocado with salt, pepper, and turmeric",
          "Heat olive oil in pan and fry eggs to desired doneness",
          "Spread avocado mixture on toast",
          "Top with fried eggs",
          "Sprinkle with red pepper flakes and hemp seeds"
        ],
        tags: ["breakfast", "vegetarian", "anti-inflammatory", "quick"],
        featured: true,
        mealPlanId,
      },
      {
        title: "Salmon Power Bowl",
        description: "Omega-3 rich salmon with quinoa, spinach, and tahini dressing for maximum anti-inflammatory benefits.",
        cookTime: 30,
        servings: 2,
        difficulty: "medium" as const,
        price: 799, // $7.99
        antiInflammatoryScore: 9.5,
        calories: 520,
        carbs: 35,
        protein: 40,
        fat: 25,
        ingredients: [
          "2 salmon fillets (6oz each)",
          "1 cup quinoa",
          "4 cups fresh spinach",
          "1 cucumber, diced",
          "1 avocado, sliced",
          "2 tbsp tahini",
          "1 lemon, juiced",
          "2 tbsp olive oil",
          "1 tsp honey",
          "Salt and pepper"
        ],
        instructions: [
          "Cook quinoa according to package directions",
          "Season salmon with salt, pepper, and olive oil",
          "Pan-sear salmon for 4-5 minutes per side",
          "Whisk tahini, lemon juice, honey, and olive oil for dressing",
          "Arrange quinoa, spinach, cucumber, and avocado in bowls",
          "Top with salmon and drizzle with tahini dressing"
        ],
        tags: ["lunch", "dinner", "high-protein", "omega-3", "gluten-free"],
        featured: true,
      },
      {
        title: "Golden Milk Chia Pudding",
        description: "Creamy overnight chia pudding infused with anti-inflammatory turmeric and warming spices.",
        cookTime: 10,
        servings: 2,
        difficulty: "easy" as const,
        price: 299, // $2.99
        antiInflammatoryScore: 8.8,
        calories: 280,
        carbs: 22,
        protein: 8,
        fat: 18,
        ingredients: [
          "1/2 cup chia seeds",
          "2 cups coconut milk",
          "1 tsp turmeric powder",
          "1/2 tsp cinnamon",
          "1/4 tsp ginger powder",
          "2 tbsp maple syrup",
          "1 tsp vanilla extract",
          "Pinch of black pepper",
          "Fresh berries for topping"
        ],
        instructions: [
          "Whisk all ingredients except berries in a bowl",
          "Let sit for 5 minutes, then whisk again to prevent clumping",
          "Cover and refrigerate for at least 4 hours or overnight",
          "Stir before serving",
          "Top with fresh berries and enjoy"
        ],
        tags: ["breakfast", "dessert", "vegan", "anti-inflammatory", "make-ahead"],
        featured: false,
      },
      {
        title: "Mediterranean Quinoa Salad",
        description: "Fresh and vibrant salad with quinoa, vegetables, and herbs in a lemon-olive oil dressing.",
        cookTime: 25,
        servings: 4,
        difficulty: "easy" as const,
        price: 499, // $4.99
        antiInflammatoryScore: 8.0,
        calories: 340,
        carbs: 45,
        protein: 12,
        fat: 14,
        ingredients: [
          "1.5 cups quinoa",
          "1 cucumber, diced",
          "2 tomatoes, chopped",
          "1/2 red onion, finely diced",
          "1/2 cup kalamata olives",
          "1/2 cup feta cheese, crumbled",
          "1/4 cup fresh parsley",
          "3 tbsp olive oil",
          "2 tbsp lemon juice",
          "1 tsp oregano"
        ],
        instructions: [
          "Cook quinoa and let cool completely",
          "Combine quinoa, cucumber, tomatoes, onion, olives, and feta",
          "Whisk olive oil, lemon juice, and oregano for dressing",
          "Toss salad with dressing",
          "Garnish with fresh parsley",
          "Chill for 30 minutes before serving"
        ],
        tags: ["lunch", "vegetarian", "mediterranean", "make-ahead", "gluten-free"],
        featured: false,
        mealPlanId,
      },
      {
        title: "Green Goddess Smoothie Bowl",
        description: "Nutrient-packed smoothie bowl with spinach, avocado, and anti-inflammatory superfoods.",
        cookTime: 10,
        servings: 1,
        difficulty: "easy" as const,
        price: 399, // $3.99
        antiInflammatoryScore: 9.0,
        calories: 380,
        carbs: 45,
        protein: 15,
        fat: 18,
        ingredients: [
          "2 cups fresh spinach",
          "1/2 avocado",
          "1 frozen banana",
          "1 cup coconut milk",
          "1 tbsp almond butter",
          "1 tsp spirulina powder",
          "1 tbsp chia seeds",
          "1 tsp honey",
          "Granola and berries for topping"
        ],
        instructions: [
          "Blend spinach, avocado, banana, coconut milk, almond butter, spirulina, and honey until smooth",
          "Pour into bowl",
          "Top with chia seeds, granola, and fresh berries",
          "Serve immediately"
        ],
        tags: ["breakfast", "smoothie", "vegan", "superfood", "anti-inflammatory"],
        featured: true,
      },
      // Add more diverse recipes
      {
        title: "Anti-Inflammatory Lentil Curry",
        description: "Warming curry with red lentils, turmeric, and coconut milk for a comforting anti-inflammatory meal.",
        cookTime: 35,
        servings: 4,
        difficulty: "medium" as const,
        price: 549, // $5.49
        antiInflammatoryScore: 8.9,
        calories: 420,
        carbs: 52,
        protein: 18,
        fat: 16,
        ingredients: [
          "1.5 cups red lentils",
          "1 can coconut milk",
          "2 tbsp coconut oil",
          "1 onion, diced",
          "3 cloves garlic, minced",
          "1 inch ginger, grated",
          "2 tsp turmeric",
          "1 tsp cumin",
          "1 tsp coriander",
          "2 cups vegetable broth",
          "2 cups spinach",
          "Salt to taste"
        ],
        instructions: [
          "Heat coconut oil in large pot",
          "Sauté onion until translucent",
          "Add garlic, ginger, and spices, cook for 1 minute",
          "Add lentils, coconut milk, and broth",
          "Simmer for 20-25 minutes until lentils are tender",
          "Stir in spinach until wilted",
          "Season with salt and serve"
        ],
        tags: ["dinner", "vegan", "curry", "high-protein", "anti-inflammatory"],
        featured: false,
        mealPlanId,
      },
      {
        title: "Berry Antioxidant Parfait",
        description: "Layered parfait with Greek yogurt, mixed berries, and anti-inflammatory nuts and seeds.",
        cookTime: 10,
        servings: 2,
        difficulty: "easy" as const,
        price: 349, // $3.49
        antiInflammatoryScore: 8.3,
        calories: 290,
        carbs: 32,
        protein: 20,
        fat: 12,
        ingredients: [
          "2 cups Greek yogurt",
          "1 cup mixed berries",
          "1/4 cup walnuts, chopped",
          "2 tbsp chia seeds",
          "2 tbsp honey",
          "1 tsp vanilla extract",
          "1/4 cup granola",
          "Fresh mint for garnish"
        ],
        instructions: [
          "Mix yogurt with honey and vanilla",
          "Layer yogurt, berries, and nuts in glasses",
          "Repeat layers",
          "Top with chia seeds and granola",
          "Garnish with fresh mint",
          "Serve immediately or chill"
        ],
        tags: ["breakfast", "snack", "vegetarian", "high-protein", "antioxidants"],
        featured: false,
      },
      {
        title: "Ginger-Miso Glazed Cod",
        description: "Delicate cod with anti-inflammatory ginger-miso glaze served with steamed vegetables.",
        cookTime: 25,
        servings: 2,
        difficulty: "medium" as const,
        price: 699, // $6.99
        antiInflammatoryScore: 8.7,
        calories: 310,
        carbs: 18,
        protein: 32,
        fat: 14,
        ingredients: [
          "2 cod fillets (6oz each)",
          "2 tbsp white miso paste",
          "1 tbsp fresh ginger, grated",
          "2 tbsp rice vinegar",
          "1 tbsp sesame oil",
          "1 tsp honey",
          "2 cups broccoli florets",
          "1 cup snap peas",
          "2 green onions, sliced"
        ],
        instructions: [
          "Preheat oven to 400°F (200°C)",
          "Whisk miso, ginger, vinegar, sesame oil, and honey",
          "Marinate cod in half the glaze for 15 minutes",
          "Steam vegetables until tender-crisp",
          "Bake cod for 12-15 minutes",
          "Serve with vegetables and remaining glaze"
        ],
        tags: ["dinner", "fish", "asian-inspired", "low-carb", "anti-inflammatory"],
        featured: false,
      },
      {
        title: "Turmeric Cauliflower Rice Bowl",
        description: "Flavorful cauliflower rice with turmeric, vegetables, and tahini dressing.",
        cookTime: 20,
        servings: 2,
        difficulty: "easy" as const,
        price: 449, // $4.49
        antiInflammatoryScore: 8.6,
        calories: 260,
        carbs: 22,
        protein: 8,
        fat: 18,
        ingredients: [
          "1 head cauliflower, riced",
          "2 tbsp olive oil",
          "1 tsp turmeric",
          "1 red bell pepper, diced",
          "1 cup cherry tomatoes",
          "1/2 cucumber, diced",
          "2 tbsp tahini",
          "1 lemon, juiced",
          "2 tbsp fresh herbs",
          "Salt and pepper"
        ],
        instructions: [
          "Heat oil in large pan",
          "Add cauliflower rice and turmeric, cook 5 minutes",
          "Add bell pepper and tomatoes, cook 3 minutes",
          "Season with salt and pepper",
          "Whisk tahini with lemon juice",
          "Serve cauliflower rice topped with cucumber, herbs, and tahini dressing"
        ],
        tags: ["lunch", "dinner", "vegan", "low-carb", "anti-inflammatory"],
        featured: false,
      }
    ];

    // Insert all recipes
    const recipeIds = [];
    for (const recipe of sampleRecipes) {
      const recipeId = await ctx.db.insert("recipes", recipe);
      recipeIds.push(recipeId);
    }

    return { 
      message: "Recipes initialized successfully", 
      mealPlansAdded: 1,
      recipesAdded: sampleRecipes.length 
    };
  },
});