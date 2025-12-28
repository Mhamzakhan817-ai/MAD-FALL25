import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Record a new flare
export const recordFlare = mutation({
  args: {
    token: v.string(),
    flareDate: v.string(), // YYYY-MM-DD format
    severity: v.number(), // 1-10
    notes: v.optional(v.string()),
    triggers: v.optional(v.array(v.string())),
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

    // Check if a flare already exists for this date
    const existingFlare = await ctx.db
      .query("flares")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", session.userId).eq("flareDate", args.flareDate)
      )
      .unique();

    if (existingFlare) {
      // Update existing flare
      await ctx.db.patch(existingFlare._id, {
        severity: args.severity,
        notes: args.notes,
        triggers: args.triggers,
      });
      return { flareId: existingFlare._id, updated: true };
    } else {
      // Create new flare record
      const flareId = await ctx.db.insert("flares", {
        userId: session.userId,
        flareDate: args.flareDate,
        severity: args.severity,
        notes: args.notes,
        triggers: args.triggers,
      });
      return { flareId, updated: false };
    }
  },
});

// Get flares for a specific date range
export const getFlares = query({
  args: {
    token: v.string(),
    startDate: v.optional(v.string()), // YYYY-MM-DD format
    endDate: v.optional(v.string()), // YYYY-MM-DD format
    limit: v.optional(v.number()),
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

    // Get flares for the user
    let flares = await ctx.db
      .query("flares")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .order("desc")
      .collect();

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      flares = flares.filter(flare => {
        const flareDate = flare.flareDate;
        if (args.startDate && flareDate < args.startDate) return false;
        if (args.endDate && flareDate > args.endDate) return false;
        return true;
      });
    }

    // Apply limit if provided
    if (args.limit) {
      flares = flares.slice(0, args.limit);
    }

    return flares;
  },
});

// Get flare for a specific date
export const getFlareByDate = query({
  args: {
    token: v.string(),
    flareDate: v.string(), // YYYY-MM-DD format
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

    // Get flare for the specific date
    const flare = await ctx.db
      .query("flares")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", session.userId).eq("flareDate", args.flareDate)
      )
      .unique();

    return flare;
  },
});

// Delete a flare record
export const deleteFlare = mutation({
  args: {
    token: v.string(),
    flareId: v.id("flares"),
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

    // Get the flare to verify ownership
    const flare = await ctx.db.get(args.flareId);
    if (!flare || flare.userId !== session.userId) {
      throw new Error("Flare not found or access denied");
    }

    // Delete the flare
    await ctx.db.delete(args.flareId);
    return { success: true };
  },
});

// Get flare statistics (average severity, frequency, etc.)
export const getFlareStats = query({
  args: {
    token: v.string(),
    days: v.optional(v.number()), // Number of days to look back (default 30)
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

    const daysBack = args.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get recent flares
    const flares = await ctx.db
      .query("flares")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    // Filter to recent flares
    const recentFlares = flares.filter(flare => flare.flareDate >= startDateStr);

    if (recentFlares.length === 0) {
      return {
        totalFlares: 0,
        averageSeverity: 0,
        frequency: 0, // flares per week
        severityDistribution: { mild: 0, moderate: 0, severe: 0 },
      };
    }

    // Calculate statistics
    const totalSeverity = recentFlares.reduce((sum, flare) => sum + flare.severity, 0);
    const averageSeverity = Math.round((totalSeverity / recentFlares.length) * 10) / 10;
    const frequency = Math.round((recentFlares.length / daysBack * 7) * 10) / 10;

    // Severity distribution
    const severityDistribution = {
      mild: recentFlares.filter(f => f.severity >= 1 && f.severity <= 3).length,
      moderate: recentFlares.filter(f => f.severity >= 4 && f.severity <= 6).length,
      severe: recentFlares.filter(f => f.severity >= 7 && f.severity <= 10).length,
    };

    return {
      totalFlares: recentFlares.length,
      averageSeverity,
      frequency,
      severityDistribution,
    };
  },
});