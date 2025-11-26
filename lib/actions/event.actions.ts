'use server'

import connectDB from "../mongodb";
import Event from "@/database/event.model"
import type { IEvent } from '@/database';

export const getsimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {


    try {
        
        await connectDB();
        const event = await Event.findOne({ slug });
        if (!event) return [];
        // use .lean() for plain objects and cast to IEvent[] so callers get a typed result
        const results = await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean();
        // cast via `unknown` to avoid TypeScript's structural mismatch between
        // Mongoose's internal `FlattenMaps` shape and our `IEvent` interface.
        // If you prefer stricter checks, map/normalize fields here instead.
        return results as unknown as IEvent[];


    } catch (error) {
        return [];
    }
}