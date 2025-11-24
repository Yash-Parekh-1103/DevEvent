import { notFound } from 'next/navigation';
import React from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailPage =  async ({params} : {params: Promise<{slug: string}>}) => {
    const {slug} = await params;
    const request = await fetch(`${BASE_URL}/api/events/${slug}`);
    const event = await request.json();

    if (!event) return notFound();




  return (
    
    <section id='event'>
        <h1>
    Event Detail: <br/>{slug}
            </h1>
    </section>
  )
}

export default EventDetailPage
