import { Play } from 'lucide-react'
import React from 'react'

const Logo = () => {
    return (
        <div className="flex gap-2 content-center">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Play className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-medium">ADON PH</span>
                <span className="text-xs">Human Resource</span>
            </div>
        </div>

    )
}

export default Logo