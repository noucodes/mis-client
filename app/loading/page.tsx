"use client";
import { Play, User, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

const ICONS: { Icon: LucideIcon; delay: string; id: string }[] = [
    { Icon: Play, delay: "0s", id: "play" },
    { Icon: User, delay: "0.2s", id: "user" },
    { Icon: Phone, delay: "0.4s", id: "phone" },
];

const DEFAULT_TEXTS = ["Initializing...", "Preparing...", "Almost ready..."];

const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  .animate-float {
    animation: float 2s ease-in-out infinite;
  }
  .animate-pulse {
    animation: pulse 0.3s ease-in-out;
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-float, .animate-pulse {
      animation: none;
    }
  }
`;

export default function Loading() {
    const [isMounted, setIsMounted] = useState(false);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [pulseStates, setPulseStates] = useState<boolean[]>(
        new Array(ICONS.length).fill(false)
    );

    useEffect(() => {
        setIsMounted(true);

        const textInterval = setInterval(() => {
            setCurrentTextIndex((prev) => (prev + 1) % DEFAULT_TEXTS.length);
        }, 2000);

        return () => clearInterval(textInterval);
    }, []);

    const handleIconClick = (index: number) => {
        setPulseStates((prev) =>
            prev.map((state, i) => (i === index ? true : state))
        );
        setTimeout(() => {
            setPulseStates((prev) =>
                prev.map((state, i) => (i === index ? false : state))
            );
        }, 300);
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLDivElement>,
        index: number
    ) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleIconClick(index);
        }
    };

    if (!isMounted) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;
    }

    return (
        <section
            className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950"
            aria-label="Loading screen with animated icons and status messages"
        >
            <style>{styles}</style>
            <div className="flex flex-col items-center gap-6">
                <div className="flex items-center justify-center gap-4">
                    {ICONS.map(({ Icon, delay, id }, index) => (
                        <div
                            key={id}
                            className="group relative cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleIconClick(index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            aria-label={`Trigger animation for icon ${index + 1}`}
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-80" />
                            <div
                                className={`relative flex items-center justify-center rounded-full border border-gray-200/60 bg-gray-100/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-blue-500/80 hover:scale-110 animate-float dark:border-gray-800/60 dark:bg-gray-900/60 dark:hover:border-blue-400/70 ${pulseStates[index] ? "animate-pulse" : ""
                                    }`}
                                style={{ animationDelay: delay }}
                            >
                                <Icon
                                    className="size-10 text-blue-500 dark:text-blue-300"
                                    aria-hidden="true"
                                    strokeWidth={2}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <p
                    className="text-base font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-300"
                    aria-live="polite"
                >
                    {DEFAULT_TEXTS[currentTextIndex]}
                </p>
            </div>
        </section>
    );
}
