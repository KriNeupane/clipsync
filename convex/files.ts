import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a short-lived URL for uploading a file
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

// Save file metadata to the database after successful upload
export const saveFile = mutation({
    args: {
        storageId: v.string(),
        name: v.string(),
        type: v.string(),
        roomCode: v.string(),
        size: v.number(),
    },
    handler: async (ctx, args) => {
        const room = await ctx.db
            .query("rooms")
            .withIndex("by_code", (q) => q.eq("code", args.roomCode))
            .first();

        if (!room || room.status === 'closed') {
            throw new Error("Session is closed or invalid");
        }

        await ctx.db.insert("files", {
            storageId: args.storageId,
            name: args.name,
            type: args.type,
            roomCode: args.roomCode,
            size: args.size,
        });
    },
});

// List files for a specific room
export const listFiles = query({
    args: { roomCode: v.string() },
    handler: async (ctx, args) => {
        const files = await ctx.db
            .query("files")
            .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
            .collect();

        // Generate download URLs for each file
        return await Promise.all(
            files.map(async (file) => ({
                ...file,
                url: await ctx.storage.getUrl(file.storageId),
            }))
        );
    },
});

// Delete a file
export const deleteFile = mutation({
    args: { id: v.id("files"), storageId: v.string() },
    handler: async (ctx, args) => {
        await ctx.storage.delete(args.storageId);
        await ctx.db.delete(args.id);
    },
});
