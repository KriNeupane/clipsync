import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    rooms: defineTable({
        code: v.string(), // The 6-digit code
        history: v.array(v.string()), // History of clips
    }).index("by_code", ["code"]),
});
