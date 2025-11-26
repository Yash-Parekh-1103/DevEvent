'use client'

import { useState } from "react"

const BookEvent = () => {

        const [email, setEmail] = useState('');
        const [submitted, setSubmitted] = useState(false);

        // after form submission this callback function will be executed
        const handleSubmit = async (e: React.FormEvent) => {

            e.preventDefault();

            setTimeout(() => {
                setSubmitted(true);
            }, 1000);


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


            </form>
        )

        }
    </div>
  )
}

export default BookEvent
