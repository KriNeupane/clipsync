import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRoom = mutation({
    args: {},
    handler: async (ctx) => {
        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const roomId = await ctx.db.insert("rooms", {
            code,
            history: [],
        });
        return code;
    },
});

export const getRoom = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const room = await ctx.db
            .query("rooms")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();
        return room;
    },
});

export const addClip = mutation({
    args: { code: v.string(), text: v.string() },
    handler: async (ctx, args) => {
        const room = await ctx.db
            .query("rooms")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (!room) return;

        // Add new clip to start of history, limit to 50 items
        const newHistory = [args.text, ...room.history].slice(0, 50);

        await ctx.db.patch(room._id, {
            history: newHistory,
        });
    },
});

export const clearHistory = mutation({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const room = await ctx.db
            .query("rooms")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (!room) return;

        await ctx.db.patch(room._id, {
            history: [],
        });
    },
});
