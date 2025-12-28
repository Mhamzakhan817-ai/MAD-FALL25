import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Search foods by name (mock API for now)
export const searchFoods = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // If query is empty or too short, return popular foods
    if (args.query.length < 2) {
      const popularFoods = await ctx.db
        .query("foods")
        .order("desc")
        .take(limit);
      return popularFoods;
    }

    // For now, do a simple name-based search since we don't have search index set up
    // In production, you'd want to use a proper search index
    const allFoods = await ctx.db.query("foods").collect();
    const filteredFoods = allFoods
      .filter(food => 
        food.name.toLowerCase().includes(args.query.toLowerCase()) ||
        (food.brand && food.brand.toLowerCase().includes(args.query.toLowerCase()))
      )
      .slice(0, limit);

    return filteredFoods;
  },
});

// Get food by ID
export const getFoodById = query({
  args: {
    foodId: v.id("foods"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.foodId);
  },
});

// Add some sample foods (for development)
export const addSampleFoods = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleFoods = [
      {
        name: "Salmon",
        brand: "Wild Caught",
        caloriesPer100g: 208,
        proteinPer100g: 25.4,
        carbsPer100g: 0,
        fatPer100g: 12.4,
        fiberPer100g: 0,
        sugarPer100g: 0,
        antiInflammatoryScore: 9,
        commonServings: [
          { name: "1 fillet (150g)", grams: 150 },
          { name: "1 serving (100g)", grams: 100 },
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
        antiInflammatoryScore: 8,
        commonServings: [
          { name: "1 cup (148g)", grams: 148 },
          { name: "1/2 cup (74g)", grams: 74 },
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
        antiInflammatoryScore: 9,
        commonServings: [
          { name: "1 cup raw (30g)", grams: 30 },
          { name: "1 cup cooked (180g)", grams: 180 },
        ],
      },
      {
        name: "White Bread",
        brand: "Generic",
        caloriesPer100g: 265,
        proteinPer100g: 9,
        carbsPer100g: 49,
        fatPer100g: 3.2,
        fiberPer100g: 2.7,
        sugarPer100g: 5.7,
        antiInflammatoryScore: 3,
        commonServings: [
          { name: "1 slice (28g)", grams: 28 },
          { name: "2 slices (56g)", grams: 56 },
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
        ],
      },
    ];

    for (const food of sampleFoods) {
      await ctx.db.insert("foods", food);
    }

    return { message: "Sample foods added successfully" };
  },
});

// Log a food entry
export const logFood = mutation({
  args: {
    token: v.string(),
    foodId: v.id("foods"),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    ),
    servingSize: v.string(),
    servingGrams: v.number(),
    logDate: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    // Verify session and get user
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    // Get food details
    const food = await ctx.db.get(args.foodId);
    if (!food) {
      throw new Error("Food not found");
    }

    // Calculate nutritional values for this serving
    const ratio = args.servingGrams / 100;
    const calories = Math.round(food.caloriesPer100g * ratio);
    const protein = Math.round(food.proteinPer100g * ratio * 10) / 10;
    const carbs = Math.round(food.carbsPer100g * ratio * 10) / 10;
    const fat = Math.round(food.fatPer100g * ratio * 10) / 10;
    
    // Store the food's base anti-inflammatory score
    const antiInflammatoryScore = food.antiInflammatoryScore;

    // Validate daily limits (example: max 5000 calories per day)
    const existingLogs = await ctx.db
      .query("foodLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", session.userId).eq("logDate", args.logDate)
      )
      .collect();

    const totalCalories = existingLogs.reduce((sum, log) => sum + log.calories, 0) + calories;
    if (totalCalories > 5000) {
      throw new Error("Daily calorie limit exceeded (5000 calories)");
    }

    // Create food log entry
    const logId = await ctx.db.insert("foodLogs", {
      userId: session.userId,
      foodId: args.foodId,
      mealType: args.mealType,
      servingSize: args.servingSize,
      servingGrams: args.servingGrams,
      logDate: args.logDate,
      calories,
      protein,
      carbs,
      fat,
      antiInflammatoryScore,
    });

    return { logId, calories, protein, carbs, fat };
  },
});

// Get daily food logs
export const getDailyLogs = query({
  args: {
    token: v.string(),
    date: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    // Verify session and get user
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    // Get all logs for the date
    const logs = await ctx.db
      .query("foodLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", session.userId).eq("logDate", args.date)
      )
      .collect();

    // Get food details for each log
    const logsWithFood = await Promise.all(
      logs.map(async (log) => {
        const food = await ctx.db.get(log.foodId);
        return {
          ...log,
          food,
        };
      })
    );

    // Group by meal type
    const groupedLogs = {
      breakfast: logsWithFood.filter(log => log.mealType === "breakfast"),
      lunch: logsWithFood.filter(log => log.mealType === "lunch"),
      dinner: logsWithFood.filter(log => log.mealType === "dinner"),
      snack: logsWithFood.filter(log => log.mealType === "snack"),
    };

    // Calculate totals
    const totals = logsWithFood.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
        antiInflammatoryScore: acc.antiInflammatoryScore + log.antiInflammatoryScore,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, antiInflammatoryScore: 0 }
    );

    // Calculate average anti-inflammatory score
    const avgAntiInflammatoryScore = logsWithFood.length > 0 
      ? Math.round((totals.antiInflammatoryScore / logsWithFood.length) * 10) / 10
      : 0;

    return {
      logs: groupedLogs,
      totals: {
        ...totals,
        antiInflammatoryScore: avgAntiInflammatoryScore,
      },
    };
  },
});

// Get food logs for a specific date
export const getFoodLogs = query({
  args: {
    token: v.string(),
    date: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    // Verify session and get user
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      return [];
    }

    // Get all logs for the date
    const logs = await ctx.db
      .query("foodLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", session.userId).eq("logDate", args.date)
      )
      .collect();

    // Get food details for each log
    const logsWithFood = await Promise.all(
      logs.map(async (log) => {
        const food = await ctx.db.get(log.foodId);
        return {
          ...log,
          food: food ? {
            name: food.name,
            caloriesPerGram: food.caloriesPer100g / 100,
            protein: food.proteinPer100g,
            carbs: food.carbsPer100g,
            fat: food.fatPer100g,
            antiInflammatoryScore: food.antiInflammatoryScore,
          } : undefined,
        };
      })
    );

    return logsWithFood;
  },
});

// Add a food log entry
export const addFoodLog = mutation({
  args: {
    token: v.string(),
    foodId: v.id("foods"),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    ),
    servingSize: v.string(),
    servingGrams: v.number(),
    logDate: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    // Verify session and get user
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    // Get food details
    const food = await ctx.db.get(args.foodId);
    if (!food) {
      throw new Error("Food not found");
    }

    // Calculate nutritional values for this serving
    const ratio = args.servingGrams / 100;
    const calories = Math.round(food.caloriesPer100g * ratio);
    const protein = Math.round(food.proteinPer100g * ratio * 10) / 10;
    const carbs = Math.round(food.carbsPer100g * ratio * 10) / 10;
    const fat = Math.round(food.fatPer100g * ratio * 10) / 10;
    
    // Store the food's base anti-inflammatory score
    // The weighting will be done in the frontend based on calories
    const antiInflammatoryScore = food.antiInflammatoryScore;

    // Validate daily limits (example: max 5000 calories per day)
    const existingLogs = await ctx.db
      .query("foodLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", session.userId).eq("logDate", args.logDate)
      )
      .collect();

    const totalCalories = existingLogs.reduce((sum, log) => sum + log.calories, 0) + calories;
    if (totalCalories > 5000) {
      throw new Error("Daily calorie limit exceeded (5000 calories)");
    }

    // Create food log entry
    const logId = await ctx.db.insert("foodLogs", {
      userId: session.userId,
      foodId: args.foodId,
      mealType: args.mealType,
      servingSize: args.servingSize,
      servingGrams: args.servingGrams,
      logDate: args.logDate,
      calories,
      protein,
      carbs,
      fat,
      antiInflammatoryScore,
    });

    return { logId, calories, protein, carbs, fat };
  },
});

// Delete a food log entry
export const deleteFoodLog = mutation({
  args: {
    token: v.string(),
    logId: v.id("foodLogs"),
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

    // Get the log to verify ownership
    const log = await ctx.db.get(args.logId);
    if (!log || log.userId !== session.userId) {
      throw new Error("Food log not found or access denied");
    }

    // Delete the log
    await ctx.db.delete(args.logId);
    return { success: true };
  },
});

// Get weekly anti-inflammatory score average
export const getWeeklyStats = query({
  args: {
    token: v.string(),
    startDate: v.string(), // YYYY-MM-DD format
    endDate: v.string(), // YYYY-MM-DD format
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

    // Get all logs for the date range
    const logs = await ctx.db
      .query("foodLogs")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    // Filter logs within date range
    const weekLogs = logs.filter(log => 
      log.logDate >= args.startDate && log.logDate <= args.endDate
    );

    if (weekLogs.length === 0) {
      return {
        averageScore: 0,
        totalCalories: 0,
        totalLogs: 0,
        dailyAverages: [],
      };
    }

    // Calculate daily averages
    const dailyData: Record<string, { scores: number[], calories: number }> = {};
    
    weekLogs.forEach(log => {
      if (!dailyData[log.logDate]) {
        dailyData[log.logDate] = { scores: [], calories: 0 };
      }
      dailyData[log.logDate].scores.push(log.antiInflammatoryScore);
      dailyData[log.logDate].calories += log.calories;
    });

    const dailyAverages = Object.entries(dailyData).map(([date, data]) => ({
      date,
      averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
      totalCalories: data.calories,
      totalLogs: data.scores.length,
    }));

    // Calculate overall weekly average
    const totalScore = weekLogs.reduce((sum, log) => sum + log.antiInflammatoryScore, 0);
    const totalCalories = weekLogs.reduce((sum, log) => sum + log.calories, 0);
    const averageScore = Math.round((totalScore / weekLogs.length) * 10) / 10;

    return {
      averageScore,
      totalCalories,
      totalLogs: weekLogs.length,
      dailyAverages: dailyAverages.sort((a, b) => a.date.localeCompare(b.date)),
    };
  },
});

// Get lifetime anti-inflammatory score statistics
export const getLifetimeStats = query({
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

    // Get all user's food logs
    const allLogs = await ctx.db
      .query("foodLogs")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    if (allLogs.length === 0) {
      return {
        averageScore: 0,
        totalCalories: 0,
        totalLogs: 0,
        daysTracked: 0,
        bestDay: null,
        worstDay: null,
        monthlyTrends: [],
      };
    }

    // Calculate overall lifetime average
    const totalScore = allLogs.reduce((sum, log) => sum + log.antiInflammatoryScore, 0);
    const totalCalories = allLogs.reduce((sum, log) => sum + log.calories, 0);
    const averageScore = Math.round((totalScore / allLogs.length) * 10) / 10;

    // Get unique days tracked
    const uniqueDays = new Set(allLogs.map(log => log.logDate));
    const daysTracked = uniqueDays.size;

    // Calculate daily averages for best/worst day
    const dailyData: Record<string, { scores: number[], calories: number }> = {};
    
    allLogs.forEach(log => {
      if (!dailyData[log.logDate]) {
        dailyData[log.logDate] = { scores: [], calories: 0 };
      }
      dailyData[log.logDate].scores.push(log.antiInflammatoryScore);
      dailyData[log.logDate].calories += log.calories;
    });

    const dailyAverages = Object.entries(dailyData).map(([date, data]) => ({
      date,
      averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
      totalCalories: data.calories,
    }));

    // Find best and worst days
    const bestDay = dailyAverages.reduce((best, current) => 
      current.averageScore > best.averageScore ? current : best
    );
    const worstDay = dailyAverages.reduce((worst, current) => 
      current.averageScore < worst.averageScore ? current : worst
    );

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = monthDate.toISOString().split('T')[0];
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
        .toISOString().split('T')[0];
      
      const monthLogs = allLogs.filter(log => 
        log.logDate >= monthStart && log.logDate <= monthEnd
      );
      
      if (monthLogs.length > 0) {
        const monthScore = monthLogs.reduce((sum, log) => sum + log.antiInflammatoryScore, 0) / monthLogs.length;
        monthlyTrends.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          averageScore: Math.round(monthScore * 10) / 10,
          totalLogs: monthLogs.length,
        });
      }
    }

    return {
      averageScore,
      totalCalories,
      totalLogs: allLogs.length,
      daysTracked,
      bestDay: {
        date: bestDay.date,
        score: Math.round(bestDay.averageScore * 10) / 10,
      },
      worstDay: {
        date: worstDay.date,
        score: Math.round(worstDay.averageScore * 10) / 10,
      },
      monthlyTrends,
    };
  },
});

// Get food diary with historical data (last 2+ weeks)
export const getFoodDiary = query({
  args: {
    token: v.string(),
    daysBack: v.optional(v.number()), // Default to 14 days, but can be more
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

    const daysBack = args.daysBack || 14;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysBack);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get all logs in the date range
    const logs = await ctx.db
      .query("foodLogs")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    // Filter logs within date range
    const diaryLogs = logs.filter(log => 
      log.logDate >= startDateStr && log.logDate <= endDateStr
    );

    // Get food details for each log
    const logsWithFood = await Promise.all(
      diaryLogs.map(async (log) => {
        const food = await ctx.db.get(log.foodId);
        return {
          ...log,
          food: food ? {
            name: food.name,
            brand: food.brand,
            antiInflammatoryScore: food.antiInflammatoryScore,
          } : null,
        };
      })
    );

    // Group by date and meal type
    const diaryByDate: Record<string, {
      date: string;
      meals: {
        breakfast: typeof logsWithFood;
        lunch: typeof logsWithFood;
        dinner: typeof logsWithFood;
        snack: typeof logsWithFood;
      };
      dailyTotals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        averageScore: number;
      };
    }> = {};

    logsWithFood.forEach(log => {
      if (!diaryByDate[log.logDate]) {
        diaryByDate[log.logDate] = {
          date: log.logDate,
          meals: {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
          },
          dailyTotals: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            averageScore: 0,
          },
        };
      }
      
      diaryByDate[log.logDate].meals[log.mealType].push(log);
    });

    // Calculate daily totals
    Object.values(diaryByDate).forEach(day => {
      const allMeals = [
        ...day.meals.breakfast,
        ...day.meals.lunch,
        ...day.meals.dinner,
        ...day.meals.snack,
      ];
      
      day.dailyTotals = {
        calories: allMeals.reduce((sum, log) => sum + log.calories, 0),
        protein: allMeals.reduce((sum, log) => sum + log.protein, 0),
        carbs: allMeals.reduce((sum, log) => sum + log.carbs, 0),
        fat: allMeals.reduce((sum, log) => sum + log.fat, 0),
        averageScore: allMeals.length > 0 
          ? Math.round((allMeals.reduce((sum, log) => sum + log.antiInflammatoryScore, 0) / allMeals.length) * 10) / 10
          : 0,
      };
    });

    // Convert to array and sort by date (newest first)
    const diaryArray = Object.values(diaryByDate).sort((a, b) => 
      b.date.localeCompare(a.date)
    );

    return {
      diary: diaryArray,
      totalDays: diaryArray.length,
      dateRange: {
        start: startDateStr,
        end: endDateStr,
      },
    };
  },
});