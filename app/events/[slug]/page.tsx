import BookEvent from '@/Components/BookEvent';
import EventCard from '@/Components/EventCard';
import { IEvent } from '@/database';
import { getsimilarEventsBySlug } from '@/lib/actions/event.actions';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import React from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


// Reusable component for event detail items

// in this we use immidiately return the JSX element without curly braces (more like auto return)
const EventDetailItem = ({icon , alt , label }: {icon : string , alt: string , label: string} ) => (

  <div className='flex-row-gap-2 items-center'>

    <Image src={icon} alt={alt} width={20} height={20} />
    <p>{label}</p>


  </div>

)

const EventAgenda = ({agendaItems} : {agendaItems : string[]}) => (
 <div className='agenda'>
    <h2>Agenda</h2>
    <ul>

  {agendaItems.map((item) => (

      <li key = {item}>{item}</li>
  ))}

    </ul>

 </div>

)

const EventTags = ({tags} : {tags : string[]}) => (

  <div className='flex flex-row gap-1.5 flex-wrap'>
     
     {  tags.map(

        (tag) => (

          <div className='pill' key={tag}>{tag}</div> ))}

  </div>
)




const EventDetailPage =  async ({params} : {params: Promise<{slug: string}>}) => {
    const {slug} = await params;
    const request = await fetch(`${BASE_URL ?? ''}/api/events/${slug}`);
    const response = await request.json();

    // API returns { event: {...} } or just the event object
    const eventData = response?.event || response;
    if (!eventData || !eventData.description) return notFound();

    const { image, date, time, location, description, overview, mode, audience, agenda, tags , organizer } = eventData;

    // Helper to normalize different stored shapes into string[]
    const parseToStringArray = (value: any): string[] => {
      if (Array.isArray(value)) {
        if (value.length === 0) return [];
        const first = value[0];
        if (typeof first === 'string' && (first.trim().startsWith('[') || first.trim().startsWith('{'))) {
          try {
            const parsed = JSON.parse(first as string);
            if (Array.isArray(parsed)) return parsed.map((v) => String(v));
          } catch (_err) {
            // fallthrough to using the array as-is
          }
        }
        return value.map((v) => String(v));
      } else if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value as string);
          if (Array.isArray(parsed)) return parsed.map((v) => String(v));
        } catch (_err) {
          // not valid JSON — treat as comma-separated list
          return (value as string).split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
      return [];
    };

    const agendaItems = parseToStringArray(agenda);
    const tagsArray = parseToStringArray(tags);

/*
  Robust parsing block for `agenda` and `tags`.
  We support several stored shapes:
    - ['item1','item2']
    - ['["item1","item2"]'] (array with JSON-stringified first element)
    - '["item1","item2"]' (JSON string)
    - 'item1, item2' (comma-separated string)

  We'll compute `agendaItems` and `tagsArray` below using these rules.
*/


    const bookings = 10;


    // type of IEvent Arrays
    const similarEvents: IEvent[] = await getsimilarEventsBySlug(slug);

  return (
    
    <section id='event'>
        <div className='header'>
          <h1>Event Description</h1>
          <p >{description}</p>
        </div>


        <div className='details'>

        {/* {Left side : event content} */}

      <div className='content'>

      <Image src={image} alt="Event Banner" width={800} height={800} className='banner' />

      <section className='flex-col-gap-2'>

        <h2>Overview</h2>
        <p>{overview}</p>
      </section>

      <section className='flex-col-gap-2'>

        <h2>Event Details</h2>
        <EventDetailItem icon = '/icons/calendar.svg' alt='calendar' label={date} />
        <EventDetailItem icon = '/icons/clock.svg' alt='clock' label={time} />
        <EventDetailItem icon = '/icons/pin.svg' alt='pin' label={location} />
        <EventDetailItem icon = '/icons/mode.svg' alt='mode' label={mode} />
        <EventDetailItem icon = '/icons/audience.svg' alt='audience' label={audience} />  

      </section>

     {/* //co-p// */}
      {/* parse agenda into an array safely; agenda can be stored as:
          - an array of strings (['item1','item2'])
          - an array with a single JSON-stringified array (['["item1","item2"]'])
          - a JSON string
          - a comma-separated string
      */}

      <EventAgenda agendaItems={agendaItems} />

      <section className='flex-col-gap-2'>
      <h2>About Organizer</h2>
      <p>{organizer}</p>

      </section>

      <EventTags tags={tagsArray} />

      </div>



        {/* {Rigth side : Booking Form} */}

        <aside className='booking'>

         <div className='signup-card'>

          <h2>Book Your Spot</h2>

          {bookings > 0 ? (

            <p className='text-sm'>

              Join {bookings} people who have already booked for their spot!
            </p>

          ) : (


            <p className='text-sm'>

              Be the first one to book your spot!
            </p>

          )}

          <BookEvent eventId={String(eventData._id)} slug={String(eventData.slug)} />
          
        
         </div>
        </aside>
          </div>

          <div className='flex-w-full flex-col gap-4 pt-20'>
            <h2>Similar Events</h2>
            <div className='events'> 

            {similarEvents.length > 0 && similarEvents.map((ev: IEvent) => (
              <EventCard key={ev.slug ?? ev.title} {...ev} />
            ))}

            
            </div>
          </div>
    </section>
  )
}


export default EventDetailPage



