import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get featured meal plans and recipes for the main recipes page
export const getFeaturedContent = query({
  args: {},
  handler: async (ctx) => {
    // Get featured 5-day meal plan
    const featuredMealPlan = await ctx.db
      .query("mealPlans")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .first();

    // Get featured individual recipes
    const featuredRecipes = await ctx.db
      .query("recipes")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(6);

    return {
      mealPlan: featuredMealPlan,
      recipes: featuredRecipes,
    };
  },
});

// Get all meal plans
export const getMealPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("mealPlans")
      .order("desc")
      .collect();
  },
});

// Get recipes for purchase page
export const getRecipesForPurchase = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    return await ctx.db
      .query("recipes")
      .order("desc")
      .take(limit);
  },
});

// Search recipes
export const searchRecipes = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    if (args.query.length < 2) {
      return [];
    }

    return await ctx.db
      .query("recipes")
      .withSearchIndex("search_title", (q) => q.search("title", args.query))
      .take(limit);
  },
});

// Get user's purchased recipes
export const getUserPurchases = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    // Get user's purchases
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    // Get the actual recipes and meal plans
    const purchasedItems = await Promise.all(
      purchases.map(async (purchase) => {
        if (purchase.itemType === "recipe") {
          const recipe = await ctx.db.get(purchase.itemId as any);
          return { ...purchase, item: recipe };
        } else {
          const mealPlan = await ctx.db.get(purchase.itemId as any);
          return { ...purchase, item: mealPlan };
        }
      })
    );

    return purchasedItems.filter(item => item.item !== null);
  },
});

// Check if user has purchased a specific item
export const hasPurchased = query({
  args: {
    token: v.string(),
    itemType: v.union(v.literal("recipe"), v.literal("mealPlan")),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      return false;
    }

    // Check if user has purchased this item
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_user_and_item", (q) => 
        q.eq("userId", session.userId)
         .eq("itemType", args.itemType)
         .eq("itemId", args.itemId)
      )
      .unique();

    return purchase !== null;
  },
});

// Purchase a recipe or meal plan
export const purchaseItem = mutation({
  args: {
    token: v.string(),
    itemType: v.union(v.literal("recipe"), v.literal("mealPlan")),
    itemId: v.string(),
    amount: v.number(),
    referralCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    // Check if already purchased
    const existingPurchase = await ctx.db
      .query("purchases")
      .withIndex("by_user_and_item", (q) => 
        q.eq("userId", session.userId)
         .eq("itemType", args.itemType)
         .eq("itemId", args.itemId)
      )
      .unique();

    if (existingPurchase) {
      throw new Error("Item already purchased");
    }

    // Create purchase record
    const purchaseId = await ctx.db.insert("purchases", {
      userId: session.userId,
      itemType: args.itemType,
      itemId: args.itemId,
      purchaseDate: new Date().toISOString().split('T')[0],
      amount: args.amount,
      referralCode: args.referralCode,
    });

    // Handle referral if provided
    if (args.referralCode) {
      const referral = await ctx.db
        .query("referrals")
        .withIndex("by_code", (q) => q.eq("referralCode", args.referralCode!))
        .unique();

      if (referral) {
        // Give referrer credit (10% of purchase)
        const referralEarning = Math.floor(args.amount * 0.1);
        await ctx.db.patch(referral._id, {
          referredUsers: referral.referredUsers + 1,
          totalEarnings: referral.totalEarnings + referralEarning,
        });
      }
    }

    return { purchaseId, success: true };
  },
});

// Get or create user's referral code
export const getUserReferralCode = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    // Check if user already has a referral code
    const existingReferral = await ctx.db
      .query("referrals")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .unique();

    if (existingReferral) {
      return existingReferral;
    }

    // Create new referral code
    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    const referralCode = user.name.toLowerCase().replace(/\s+/g, '') + Math.random().toString(36).substring(2, 8);
    
    const referralId = await ctx.db.insert("referrals", {
      userId: session.userId,
      referralCode,
      referredUsers: 0,
      totalEarnings: 0,
    });

    return await ctx.db.get(referralId);
  },
});

// Generate grocery list from recipes
export const generateGroceryList = mutation({
  args: {
    token: v.string(),
    recipeIds: v.array(v.id("recipes")),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    // Get all recipes
    const recipes = await Promise.all(
      args.recipeIds.map(id => ctx.db.get(id))
    );

    // Combine all ingredients
    const ingredientMap = new Map<string, { quantity: string, category: string }>();
    
    recipes.forEach(recipe => {
      if (recipe) {
        recipe.ingredients.forEach(ingredient => {
          // Simple ingredient parsing - in production, you'd want more sophisticated parsing
          const category = categorizeIngredient(ingredient);
          ingredientMap.set(ingredient, { quantity: "1", category });
        });
      }
    });

    // Convert to array format
    const ingredients = Array.from(ingredientMap.entries()).map(([name, info]) => ({
      name,
      quantity: info.quantity,
      category: info.category,
      checked: false,
    }));

    // Create grocery list
    const groceryListId = await ctx.db.insert("groceryLists", {
      userId: session.userId,
      title: args.title,
      recipeIds: args.recipeIds,
      ingredients,
      createdDate: new Date().toISOString().split('T')[0],
    });

    return { groceryListId, success: true };
  },
});

// Submit contact information for purchase
export const submitContactInfo = mutation({
  args: {
    token: v.string(),
    contactInfo: v.object({
      fullName: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      zipCode: v.optional(v.string()),
      specialRequests: v.optional(v.string()),
    }),
    itemType: v.union(v.literal("recipe"), v.literal("mealPlan")),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    // Store contact information
    const contactId = await ctx.db.insert("contactSubmissions", {
      userId: session.userId,
      itemType: args.itemType,
      itemId: args.itemId,
      fullName: args.contactInfo.fullName,
      email: args.contactInfo.email,
      phone: args.contactInfo.phone,
      address: args.contactInfo.address,
      city: args.contactInfo.city,
      zipCode: args.contactInfo.zipCode,
      specialRequests: args.contactInfo.specialRequests,
      submissionDate: new Date().toISOString().split('T')[0],
    });

    return { contactId, success: true };
  },
});

// Get recipe by ID (for viewing purchased recipes)
export const getRecipeById = query({
  args: {
    recipeId: v.id("recipes"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    // Get the recipe
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      return null;
    }

    // Check if user has purchased this recipe
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_user_and_item", (q) => 
        q.eq("userId", session.userId)
         .eq("itemType", "recipe")
         .eq("itemId", args.recipeId)
      )
      .unique();

    // Return recipe with purchase status
    return {
      ...recipe,
      isPurchased: purchase !== null,
      purchaseDate: purchase?.purchaseDate,
    };
  },
});

// Helper function to categorize ingredients
function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase();
  
  if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || lower.includes('fish') || lower.includes('salmon')) {
    return 'meat';
  }
  if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || lower.includes('butter')) {
    return 'dairy';
  }
  if (lower.includes('apple') || lower.includes('banana') || lower.includes('berry') || lower.includes('spinach') || lower.includes('carrot')) {
    return 'produce';
  }
  if (lower.includes('bread') || lower.includes('rice') || lower.includes('pasta') || lower.includes('flour')) {
    return 'grains';
  }
  if (lower.includes('oil') || lower.includes('salt') || lower.includes('pepper') || lower.includes('spice')) {
    return 'pantry';
  }
  
  return 'other';
}