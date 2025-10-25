import React from 'react'

const Construction = () => {
    return (
        <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md text-center">
                <ConstructionIcon className="mx-auto h-12 w-12 text-primary" />
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Under Construction</h1>
                <p className="mt-4 text-muted-foreground">
                    We're working hard to bring you something amazing. Please check back soon.
                </p>
                <div className="mt-6">
                    <div className="mx-auto h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        </div>
    )
}

export default Construction


function ConstructionIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="2" y="6" width="20" height="8" rx="1" />
            <path d="M17 14v7" />
            <path d="M7 14v7" />
            <path d="M17 3v3" />
            <path d="M7 3v3" />
            <path d="M10 14 2.3 6.3" />
            <path d="m14 6 7.7 7.7" />
            <path d="m8 6 8 8" />
        </svg>
    )
}