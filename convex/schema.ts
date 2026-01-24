import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    rooms: defineTable({
        code: v.string(), // The 6-digit code
        history: v.array(v.string()), // History of clips
        status: v.optional(v.string()), // 'active' | 'closed'
    }).index("by_code", ["code"]),

    files: defineTable({
        storageId: v.string(), // ID returned by Convex Storage
        name: v.string(),      // Original filename
        type: v.string(),      // MIME type
        roomCode: v.string(),  // Room code it belongs to
        size: v.number(),      // File size in bytes
    }).index("by_roomCode", ["roomCode"]),
});
