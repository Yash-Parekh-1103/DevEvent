'use client'

import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import { useState } from "react"

type BookEventProps = {
    eventId?: string | null;
    slug?: string | null;
}

const BookEvent = ({ eventId, slug }: BookEventProps) => {

                const [email, setEmail] = useState('');
                const [submitted, setSubmitted] = useState(false);
                const [error, setError] = useState<string | null>(null);
                const [info, setInfo] = useState<string | null>(null);

                // after form submission this callback function will be executed
                const handleSubmit = async (e: React.FormEvent) => {

                        e.preventDefault();

                        try {
                            // call server action to create booking; createBooking expects { eventID, slug, email }
                            const res = await createBooking({ eventId: eventId ?? '', slug: slug ?? '', email });

                            if (res?.success) {
                                // Check if this was an informational response (duplicate booking) or successful booking
                                if (res?.info) {
                                    // Already booked — show friendly blue info message
                                    setInfo(res.info);
                                    setError(null);
                                    posthog.capture('event booking already exists', { eventId, slug, email });
                                } else {
                                    // New booking successful
                                    setSubmitted(true);
                                    setError(null);
                                    setInfo(null);
                                    posthog.capture('event booked!', { eventId, slug, email });
                                }
                            } else {
                                // server responded but indicated failure
                                const msg = res?.error?.message ?? JSON.stringify(res?.error ?? res ?? {});
                                console.error('Booking failed', msg);
                                setError(msg || 'Booking failed');
                                setInfo(null);
                                posthog.capture('event booking failed!', { eventId, slug, email, reason: msg });
                            }
                        } catch (err: any) {
                            // network or runtime failure when calling the server action
                            const isAbort = err?.name === 'AbortError' || (err?.message && err.message.includes('aborted'));
                            console.error('Booking request failed', err);
                            setError(isAbort ? 'Request was aborted' : (err?.message ?? String(err)));
                            setInfo(null);
                            posthog.capture('event booking failed!', { eventId, slug, email, reason: String(err) });
                        }

                }



  return (
    <div id="book-event">
        { submitted ? (

            <p className="text-sm">Thank You for signing up!</p>

        ) : (

            <form onSubmit={handleSubmit}>
                <div>

                    <label htmlFor="email">Email  Address</label>
                    <input type="email"
                     value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      id="email"
                      placeholder="Enter Your Email Address"/>
                </div>

                <button type="submit" className="button-submit">Submit</button>

                {error && (
                    <p className="text-sm text-red-500 mt-2">{error}</p>
                )}

                {info && (
                    <p className="text-sm text-blue-500 mt-2">{info}</p>
                )}


            </form>
        )

        }
    </div>
  )
}

export default BookEvent
