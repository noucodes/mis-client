"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

export function ApplicationFunnel() {
    const stages = [
        { name: "Applicants", count: 120 },
        { name: "Initial Interview", count: 80 },
        { name: "Examination", count: 50 },
        { name: "Final Interview", count: 30 },
        { name: "Hired", count: 10 },
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-center">
                    Application Funnel
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-center w-full">
                    {stages.map((stage, index) => (
                        <div
                            key={index}
                            className="flex flex-col sm:flex-row items-center relative text-center"
                        >
                            {/* Circle */}
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-blue-500 text-white text-sm sm:text-base font-bold shadow-md">
                                        {index + 1}
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 text-center whitespace-nowrap">
                                        {stage.name}
                                    </div>
                                </div>

                                <p className="mt-2 text-xs sm:text-sm font-medium text-gray-700">{stage.name}</p>
                                <p className="text-sm sm:text-base font-semibold text-gray-900">{stage.count}</p>
                            </div>

                            {/* Connecting Lines */}
                            {index < stages.length - 1 && (
                                <>
                                    {/* Horizontal line (desktop) */}
                                    <div className="hidden sm:block w-16 sm:w-20 md:w-24 h-[2px] bg-gray-300 mx-2 sm:mx-3 md:mx-5 rounded-full translate-y-[-0.9rem] sm:translate-y-[-1.1rem]" />
                                    {/* Vertical line (mobile) */}
                                    <div className="sm:hidden w-[2px] h-6 sm:h-8 my-2 sm:my-4 rounded-full bg-gray-300" />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}