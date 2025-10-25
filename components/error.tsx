import React from 'react'
import { Button } from './ui/button'

const Error = () => {
    return (
        <section className='bg-background section-padding-y relative flex flex-col items-center overflow-hidden h-full justify-center'>
            <div className='container-padding-x container flex flex-col items-center gap-4 lg:gap-4'>
                <div className="text-md font-medium w-fit bg-transparent text-muted-foreground">Error 404</div>
                <h1 className="text-5xl font-bold">Page not found</h1>
                <h1 className="text-muted-foreground text-base lg:text-lg">Sorry, we couldn't find the page you're looking for. Please check the URL or navigate back home.</h1>
            </div>
        </section>
    )
}

export default Error