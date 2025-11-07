"use client"
import React, { useState, useEffect } from 'react';

// Displays the current local system time, updating every second.
const CurrentSystemTime: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return <p className='text-sm text-muted-foreground'>Current System Time: <strong>{time.toLocaleDateString()} at {time.toLocaleTimeString()}</strong></p>;
};

export default CurrentSystemTime;