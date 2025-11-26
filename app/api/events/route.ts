import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from "cloudinary";
import { resolve } from "path";



export async function POST(req: NextRequest) {

    try {

        await connectDB();
        // Accept JSON body from client. If you're sending multipart/form-data
        // (e.g. file uploads) you'll need to parse `req.formData()` and build
        // the event object accordingly. For typical JSON payloads, use req.json().
        const contentType = req.headers.get("content-type") || "";

        let event: any;
        // declare formData in outer scope so it's available after the branch
        // (and so TypeScript doesn't complain that the name is not found)
        let formData: FormData | undefined;

        if (contentType.includes("application/json")) {
            event = await req.json();
        } else if (contentType.includes("multipart/form-data")) {
            // parse formData and convert to a plain object
            formData = await req.formData();
            // Note: formData entries for arrays should be sent as JSON strings
            event = Object.fromEntries(formData.entries());
            // try to parse JSON fields that are sent as strings (agenda, tags, etc.)
            if (typeof event.agenda === 'string') {
                try { event.agenda = JSON.parse(event.agenda); } catch {};
            }
            if (typeof event.tags === 'string') {
                try { event.tags = JSON.parse(event.tags); } catch {};
            }
        } else {
            // default to json parse
            event = await req.json();
        }

        // Access file only if formData was parsed above
        const file = formData ? (formData.get("image") as any || null) : null;

        // If a File was uploaded, save it to `public/uploads` and set
        // `event.image` to the saved URL path (Mongoose expects a string).
        if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

                // sanitize filename and prepend timestamp to avoid collisions
                const safeName = (file.name || 'upload').toString().replace(/[^a-z0-9.\-]/gi, '-');
                const filename = `${Date.now()}-${safeName}`;
                const filepath = path.join(uploadsDir, filename);

                fs.writeFileSync(filepath, buffer);

                // Set the image field to the public URL path
                event.image = `/uploads/${filename}`;
            } catch (err) {
                console.error('Failed to save uploaded file:', err);
                // proceed without setting image so Mongoose will validate and return an error
            }
        }

        if(!file) return NextResponse.json({Message : "Image is required"}, {status : 400}); 

        // Safely parse tags and agenda only if formData is present, otherwise fall back to values in event or empty arrays
        let tags: any[] = [];
        let agenda: any[] = [];

        if (formData) {
            const rawTags = formData.get('tags');
            if (typeof rawTags === 'string') {
                try { tags = JSON.parse(rawTags); } catch { tags = []; }
            } else if (rawTags != null) {
                try { tags = JSON.parse(String(rawTags)); } catch { tags = []; }
            }

            const rawAgenda = formData.get('agenda');
            if (typeof rawAgenda === 'string') {
                try { agenda = JSON.parse(rawAgenda); } catch { agenda = []; }
            } else if (rawAgenda != null) {
                try { agenda = JSON.parse(String(rawAgenda)); } catch { agenda = []; }
            }
        } else {
            if (Array.isArray(event?.tags)) tags = event.tags;
            if (Array.isArray(event?.agenda)) agenda = event.agenda;
        }

        // assign parsed values back to event so Mongoose validation sees them
        event.tags = tags;
        event.agenda = agenda;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // create and let mongoose validate — validation errors will be caught below
        
        const uploadResult = await new Promise((resolve, reject) => {

            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: "DevEvent" }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({message : "Event Created Successfully" , event : createdEvent}, { status: 201 });
        
    } catch (e) {
        // Log full error for server-side debugging
        console.error(e);

        // If this is a Mongoose validation error, return structured details
        // so the client can show helpful messages.
        if (e && typeof e === 'object' && (e as any).name === 'ValidationError') {
            const errors = Object.values((e as any).errors || {}).map((er: any) => er.message || er);
            return NextResponse.json({ Message: 'Event validation failed', errors, _message: (e as any).message }, { status: 400 });
        }

        return NextResponse.json({ Message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 });
    }
}



export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const events = await Event.find().sort({ createdAt: -1 }); // Fetch all events, sorted by creation date (newest first)
        return NextResponse.json({ message: "Event fetched Successfully" , events }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ Message: 'Failed to fetch events', error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 });
    }
}