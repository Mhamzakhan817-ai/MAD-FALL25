import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get featured supplements
export const getFeaturedSupplements = query({
  args: {},
  handler: async (ctx) => {
    const supplements = await ctx.db
      .query("supplements")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();
    
    return supplements;
  },
});

// Get all supplements for browsing
export const getAllSupplements = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      const supplements = await ctx.db
        .query("supplements")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .take(args.limit || 20);
      return supplements;
    } else {
      const supplements = await ctx.db
        .query("supplements")
        .take(args.limit || 20);
      return supplements;
    }
  },
});

// Search supplements
export const searchSupplements = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.query.length < 2) {
      return [];
    }

    const results = await ctx.db
      .query("supplements")
      .withSearchIndex("search_title", (q) => q.search("title", args.query))
      .take(args.limit || 10);

    return results;
  },
});

// Get user's purchased supplements
export const getUserSupplementPurchases = query({
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

    // Get user's supplement purchases
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .filter((q) => q.eq(q.field("itemType"), "supplement"))
      .collect();

    return purchases;
  },
});

// Check if user has purchased a specific supplement
export const hasSupplementPurchased = query({
  args: {
    token: v.string(),
    supplementId: v.string(),
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

    // Check if user has purchased this supplement
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_user_and_item", (q) => 
        q.eq("userId", session.userId)
         .eq("itemType", "supplement")
         .eq("itemId", args.supplementId)
      )
      .unique();

    return !!purchase;
  },
});

// Purchase a supplement guide
export const purchaseSupplement = mutation({
  args: {
    token: v.string(),
    supplementId: v.string(),
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

    // Get supplement details
    const supplement = await ctx.db
      .query("supplements")
      .filter((q) => q.eq(q.field("_id"), args.supplementId))
      .unique();

    if (!supplement) {
      throw new Error("Supplement not found");
    }

    // Check if already purchased
    const existingPurchase = await ctx.db
      .query("purchases")
      .withIndex("by_user_and_item", (q) => 
        q.eq("userId", session.userId)
         .eq("itemType", "supplement")
         .eq("itemId", args.supplementId)
      )
      .unique();

    if (existingPurchase) {
      throw new Error("Supplement already purchased");
    }

    // Create purchase record
    const purchaseId = await ctx.db.insert("purchases", {
      userId: session.userId,
      itemType: "supplement",
      itemId: args.supplementId,
      purchaseDate: new Date().toISOString().split('T')[0],
      amount: supplement.price,
      referralCode: args.referralCode,
    });

    // Handle referral if provided
    if (args.referralCode) {
      const referral = await ctx.db
        .query("referrals")
        .withIndex("by_code", (q) => q.eq("referralCode", args.referralCode!))
        .unique();

      if (referral) {
        // Update referral earnings (10% commission)
        const commission = Math.floor(supplement.price * 0.1);
        await ctx.db.patch(referral._id, {
          referredUsers: referral.referredUsers + 1,
          totalEarnings: referral.totalEarnings + commission,
        });
      }
    }

    return { 
      purchaseId, 
      message: "Supplement guide purchased successfully!",
      supplement: {
        title: supplement.title,
        price: supplement.price,
      }
    };
  },
});

// Get supplement by ID (for viewing purchased supplements)
export const getSupplementById = query({
  args: {
    supplementId: v.string(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const supplement = await ctx.db
      .query("supplements")
      .filter((q) => q.eq(q.field("_id"), args.supplementId))
      .unique();

    if (!supplement) {
      return null;
    }

    // If token provided, check if user has purchased
    let hasPurchased = false;
    if (args.token) {
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token!))
        .unique();

      if (session && session.expiresAt >= Date.now()) {
        const purchase = await ctx.db
          .query("purchases")
          .withIndex("by_user_and_item", (q) => 
            q.eq("userId", session.userId)
             .eq("itemType", "supplement")
             .eq("itemId", args.supplementId)
          )
          .unique();
        
        hasPurchased = !!purchase;
      }
    }

    // Return limited info if not purchased
    if (!hasPurchased) {
      return {
        _id: supplement._id,
        title: supplement.title,
        description: supplement.description,
        category: supplement.category,
        price: supplement.price,
        antiInflammatoryScore: supplement.antiInflammatoryScore,
        benefits: supplement.benefits.slice(0, 3), // Only show first 3 benefits
        imageUrl: supplement.imageUrl,
        isPurchased: false,
      };
    }

    // Return full info if purchased
    return {
      ...supplement,
      isPurchased: true,
    };
  },
});

// Submit contact information for supplement purchase
export const submitSupplementContactInfo = mutation({
  args: {
    token: v.string(),
    supplementId: v.string(),
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    specialRequests: v.optional(v.string()),
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

    // Create contact submission
    const submissionId = await ctx.db.insert("contactSubmissions", {
      userId: session.userId,
      itemType: "supplement",
      itemId: args.supplementId,
      fullName: args.fullName,
      email: args.email,
      phone: args.phone,
      address: args.address,
      city: args.city,
      zipCode: args.zipCode,
      specialRequests: args.specialRequests,
      submissionDate: new Date().toISOString().split('T')[0],
    });

    return { 
      submissionId,
      message: "Contact information submitted successfully! We'll be in touch soon." 
    };
  },
});