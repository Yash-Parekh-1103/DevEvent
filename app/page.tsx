import EventCard from "@/Components/EventCard"
import ExploreBtn from "@/Components/ExploreBtn"
import { IEvent } from "@/database";
// import { events } from "@/lib/constants"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Ensure BASE_URL is a usable absolute URL in production builds.
// Some deploys may set only the hostname (e.g. 'devevents-delta.vercel.app').
// If so, prepend `https://`. When BASE_URL is not set, fall back to
// a relative API path by using an empty string.
const normalizedBase = BASE_URL
  ? BASE_URL.startsWith('http')
    ? BASE_URL
    : `https://${BASE_URL}`
  : '';
// Sample events data

const page =  async () => {

  const response = await fetch(`${normalizedBase}/api/events`);
  const data = await response.json();
  // API returns { message, events } — ensure we use the events array
  const events: IEvent[] = Array.isArray(data?.events) ? data.events : [];



// /api/events/next-js-conf-2026 INC++ seo

  return (
    <section>
      <h1 className="text-center">The Hub For Every Dev <br /> Event You Can't Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferences</p>
      <ExploreBtn/>
      <div className='mt-20'>
        <h3>Featured Events</h3>
      </div>

      <ul className="events mt-16">
    
    

      {/* // Here we have used parantheses to directly return the JSX element from the arrow function
      // If we used curly braces, we would need to use a return statement inside the function body
      // This is a concise way to map over an array and render elements */}

    {  events.map((event: IEvent) => (
        // <li key={event}>Event {event}</li> //before
        <li key={event.title}>
          <EventCard {...event} />
        </li>
      ))
    }
   </ul>
   
    </section>
  )
}

export default page
