'use server'

import { Booking } from "@/database";
import connectDB from "../mongodb";

// this function will accept this 3 things eventID , slug , email.
export const createBooking = async ({eventId , slug , email}: {eventId: string , slug: string , email: string}) => {

    try {
        
        await connectDB();
        // creating new instense of a booking , with the information we have right here from the params (user)
       
       //we also can put .lean() if we want to get back a plain JS object instead of mongoose document
                const booking = await Booking.create({eventId, slug, email});
                // Convert mongoose document to a plain JS object safe for serialization
                const plain = booking && typeof (booking as any).toObject === 'function'
                    ? (booking as any).toObject()
                    : JSON.parse(JSON.stringify(booking));

                // remove mongoose internal fields that may cause serialization issues
                if (plain) {
                    delete plain.__v;
                }

                // Normalize fields that are not plain values (ObjectId, Date)
                const safeBooking = {
                    id: plain._id ? String(plain._id) : undefined,
                    eventId: plain.eventId ? String(plain.eventId) : undefined,
                    email: plain.email,
                    createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : undefined,
                    updatedAt: plain.updatedAt ? new Date(plain.updatedAt).toISOString() : undefined,
                };

                return { success: true, booking: safeBooking };

    } catch (error) {
                console.log("Booking creation failed", error);
                // Check if it's a duplicate key error (MongoDB error code 11000)
                if (error instanceof Error && error.message.includes('E11000')) {
                    // User already booked this event — return as success with info message
                    return { success: true, info: 'You have already booked this event' };
                }
                // For other errors, return as failure
                const message = error instanceof Error ? error.message : String(error);
                return { success: false, error: { message } };
    }

}