import EventCard from "@/Components/EventCard"
import ExploreBtn from "@/Components/ExploreBtn"
import { IEvent } from "@/database";
import { getAllEvents } from '@/lib/actions/event.actions';
// Sample events data

const page =  async () => {

  // Fetch events directly from the database via server-side helper to
  // avoid making HTTP requests during prerender.
  const events: IEvent[] = await getAllEvents();



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
