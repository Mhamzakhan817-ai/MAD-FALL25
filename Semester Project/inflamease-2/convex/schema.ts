import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table for authentication
  users: defineTable({
    email: v.string(),
    name: v.string(),
    hashedPassword: v.string(),
    // OAuth provider info (optional)
    googleId: v.optional(v.string()),
    appleId: v.optional(v.string()),
    // User preferences
    dailyCalorieGoal: v.optional(v.number()),
    onboardingCompleted: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_google_id", ["googleId"])
    .index("by_apple_id", ["appleId"]),

  // Food database - can be populated from nutrition APIs
  foods: defineTable({
    name: v.string(),
    brand: v.optional(v.string()),
    // Nutritional info per 100g
    caloriesPer100g: v.number(),
    proteinPer100g: v.number(),
    carbsPer100g: v.number(),
    fatPer100g: v.number(),
    fiberPer100g: v.optional(v.number()),
    sugarPer100g: v.optional(v.number()),
    // Anti-inflammatory score (1-10, higher is better)
    antiInflammatoryScore: v.number(),
    // Common serving sizes
    commonServings: v.array(v.object({
      name: v.string(), // e.g., "1 cup", "1 medium apple"
      grams: v.number(),
    })),
  })
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["brand"],
    }),

  // User's daily food logs
  foodLogs: defineTable({
    userId: v.id("users"),
    foodId: v.id("foods"),
    // Meal category
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"), 
      v.literal("dinner"),
      v.literal("snack")
    ),
    // Serving info
    servingSize: v.string(), // e.g., "1 cup", "150g"
    servingGrams: v.number(),
    // Date (stored as ISO string for easy querying)
    logDate: v.string(), // YYYY-MM-DD format
    // Calculated nutritional values for this serving
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    antiInflammatoryScore: v.number(),
  })
    .index("by_user_and_date", ["userId", "logDate"])
    .index("by_user_and_meal", ["userId", "logDate", "mealType"])
    .index("by_user", ["userId"]),

  // Inflammatory flare tracking
  flares: defineTable({
    userId: v.id("users"),
    // Date of the flare
    flareDate: v.string(), // YYYY-MM-DD format
    // Severity level (1-10)
    severity: v.number(),
    // User notes about symptoms and feelings
    notes: v.optional(v.string()),
    // Potential triggers or additional context
    triggers: v.optional(v.array(v.string())),
  })
    .index("by_user_and_date", ["userId", "flareDate"])
    .index("by_user", ["userId"]),

  // User sessions for authentication
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  // Recipe meal plans (5-day plans, etc.)
  mealPlans: defineTable({
    title: v.string(),
    description: v.string(),
    duration: v.number(), // days
    price: v.number(), // in cents
    imageUrl: v.optional(v.string()),
    antiInflammatoryFocus: v.boolean(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    totalRecipes: v.number(),
    featured: v.boolean(),
  })
    .index("by_featured", ["featured"])
    .index("by_price", ["price"]),

  // Individual recipes
  recipes: defineTable({
    title: v.string(),
    description: v.string(),
    cookTime: v.number(), // minutes
    servings: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    price: v.number(), // in cents
    imageUrl: v.optional(v.string()),
    antiInflammatoryScore: v.number(), // 1-10
    calories: v.number(),
    carbs: v.number(), // grams
    protein: v.number(), // grams
    fat: v.number(), // grams
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()),
    tags: v.array(v.string()), // breakfast, lunch, dinner, snack, vegetarian, etc.
    featured: v.boolean(),
    mealPlanId: v.optional(v.id("mealPlans")), // if part of a meal plan
  })
    .index("by_featured", ["featured"])
    .index("by_meal_plan", ["mealPlanId"])
    .index("by_tags", ["tags"])
    .index("by_price", ["price"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["tags", "difficulty"],
    }),

  // User purchases
  purchases: defineTable({
    userId: v.id("users"),
    itemType: v.union(v.literal("recipe"), v.literal("mealPlan"), v.literal("supplement")),
    itemId: v.string(), // recipe, meal plan, or supplement ID
    purchaseDate: v.string(), // YYYY-MM-DD
    amount: v.number(), // in cents
    referralCode: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_item", ["userId", "itemType", "itemId"])
    .index("by_referral", ["referralCode"]),

  // Referral system
  referrals: defineTable({
    userId: v.id("users"),
    referralCode: v.string(),
    referredUsers: v.number(), // count
    totalEarnings: v.number(), // in cents
  })
    .index("by_user", ["userId"])
    .index("by_code", ["referralCode"]),

  // Grocery lists generated from recipes
  groceryLists: defineTable({
    userId: v.id("users"),
    title: v.string(),
    recipeIds: v.array(v.id("recipes")),
    ingredients: v.array(v.object({
      name: v.string(),
      quantity: v.string(),
      category: v.string(), // produce, dairy, meat, etc.
      checked: v.boolean(),
    })),
    createdDate: v.string(), // YYYY-MM-DD
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "createdDate"]),

  // Contact submissions for purchases
  contactSubmissions: defineTable({
    userId: v.id("users"),
    itemType: v.union(v.literal("recipe"), v.literal("mealPlan"), v.literal("supplement")),
    itemId: v.string(),
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    specialRequests: v.optional(v.string()),
    submissionDate: v.string(), // YYYY-MM-DD
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_item", ["itemType", "itemId"]),

  // Anti-inflammatory supplements
  supplements: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(), // herbal, omega-3, probiotics, antioxidants, etc.
    price: v.number(), // in cents
    imageUrl: v.optional(v.string()),
    antiInflammatoryScore: v.number(), // 1-10
    benefits: v.array(v.string()),
    dosageRecommendation: v.string(),
    scientificEvidence: v.string(),
    potentialSideEffects: v.array(v.string()),
    interactions: v.array(v.string()),
    qualityBrands: v.array(v.string()),
    featured: v.boolean(),
  })
    .index("by_featured", ["featured"])
    .index("by_category", ["category"])
    .index("by_price", ["price"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["category"],
    }),
});