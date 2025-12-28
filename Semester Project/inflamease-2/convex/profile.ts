import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Update user settings
export const updateSettings = mutation({
  args: {
    token: v.string(),
    dailyCalorieGoal: v.optional(v.number()),
    name: v.optional(v.string()),
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

    // Update user profile
    const updates: any = {};
    if (args.dailyCalorieGoal !== undefined) {
      updates.dailyCalorieGoal = args.dailyCalorieGoal;
    }
    if (args.name !== undefined) {
      updates.name = args.name;
    }

    await ctx.db.patch(session.userId, updates);
    return { success: true };
  },
});

// Export user data
export const exportUserData = query({
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
      throw new Error("Invalid or expired session");
    }

    // Get user data
    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error("User not found");

    // Get all food logs
    const foodLogs = await ctx.db
      .query("foodLogs")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    // Get all flares
    const flares = await ctx.db
      .query("flares")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    return {
      user: {
        name: user.name,
        email: user.email,
        dailyCalorieGoal: user.dailyCalorieGoal,
        onboardingCompleted: user.onboardingCompleted,
      },
      foodLogs: foodLogs.map(log => ({
        date: log.logDate,
        mealType: log.mealType,
        servingSize: log.servingSize,
        servingGrams: log.servingGrams,
        calories: log.calories,
        protein: log.protein,
        carbs: log.carbs,
        fat: log.fat,
        antiInflammatoryScore: log.antiInflammatoryScore,
      })),
      flares: flares.map(flare => ({
        date: flare.flareDate,
        severity: flare.severity,
        notes: flare.notes,
        triggers: flare.triggers,
      })),
      exportDate: new Date().toISOString(),
    };
  },
});