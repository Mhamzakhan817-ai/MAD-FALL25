import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Mock password hashing (in production, use proper bcrypt)
function hashPassword(password: string): string {
  // This is a simple mock - in production use bcrypt or similar
  return `hashed_${password}`;
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashedPassword === `hashed_${password}`;
}

// Generate a simple session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Sign up with email and password
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    referralCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      hashedPassword: hashPassword(args.password),
      onboardingCompleted: false,
    });

    // Handle referral if provided
    if (args.referralCode) {
      const referral = await ctx.db
        .query("referrals")
        .withIndex("by_code", (q) => q.eq("referralCode", args.referralCode!))
        .unique();

      if (referral) {
        // Credit the referrer with earnings (e.g., $1.00 = 100 cents per referral)
        const referralBonus = 100; // $1.00 per referral
        await ctx.db.patch(referral._id, {
          referredUsers: referral.referredUsers + 1,
          totalEarnings: referral.totalEarnings + referralBonus,
        });
      }
    }

    // Create session
    const token = generateSessionToken();
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
    });

    return { userId, token, user: { id: userId, email: args.email, name: args.name } };
  },
});

// Sign in with email and password
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user || !verifyPassword(args.password, user.hashedPassword)) {
      throw new Error("Invalid email or password");
    }

    // Create new session
    const token = generateSessionToken();
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
    });

    return { 
      userId: user._id, 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        onboardingCompleted: user.onboardingCompleted 
      } 
    };
  },
});

// Get current user from session token
export const getCurrentUser = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find valid session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    // Get user
    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      onboardingCompleted: user.onboardingCompleted,
      dailyCalorieGoal: user.dailyCalorieGoal,
    };
  },
});

// Complete onboarding
export const completeOnboarding = mutation({
  args: {
    token: v.string(),
    dailyCalorieGoal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Find valid session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    // Update user
    await ctx.db.patch(session.userId, {
      onboardingCompleted: true,
      dailyCalorieGoal: args.dailyCalorieGoal,
    });

    return { success: true };
  },
});

// Sign out (invalidate session)
export const signOut = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});