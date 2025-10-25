"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface StepperStep {
    id: string;
    label: string;
    description?: string;
}

interface StepperProps {
    steps: StepperStep[];
    currentStep: number;
    orientation?: "vertical" | "horizontal";
    className?: string;
}

export function Stepper({ steps, currentStep, orientation = "horizontal", className }: StepperProps) {
    return (
        <TooltipProvider>
            <div
                className={cn(
                    "w-full",
                    orientation === "vertical" ? "space-y-4" : "flex items-start justify-between",
                    className
                )}
            >
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isPending = index > currentStep;
                    const isFirst = index === 0;
                    const isLast = index === steps.length - 1;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                orientation === "vertical" ? "flex items-start gap-4" : "flex flex-col items-center flex-1"
                            )}
                            role="listitem"
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            <div
                                className={cn(
                                    orientation === "vertical"
                                        ? "flex flex-col items-center"
                                        : "flex items-center justify-center w-full"
                                )}
                            >
                                {/* Left Spacer or Connector */}
                                {orientation === "horizontal" && (
                                    isFirst ? (
                                        <div className="h-1 flex-1 mx-2" /> // Spacer for first step
                                    ) : (
                                        <div
                                            className={cn(
                                                "h-1 flex-1",
                                                isCompleted || isCurrent ? "bg-emerald-500" : "bg-gray-200"
                                            )}
                                        />
                                    )
                                )}

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all shadow-md",
                                                isCompleted && "border-emerald-500 bg-emerald-500 text-white shadow-emerald-200",
                                                isCurrent && "border-blue-600 bg-blue-600 text-white shadow-blue-200 ring-4 ring-blue-100",
                                                isPending && "border-gray-200 bg-gray-50 text-gray-400 shadow-sm"
                                            )}
                                        >
                                            {isCompleted ? (
                                                <CheckIcon className="h-3 w-3" />
                                            ) : (
                                                <span className="text-sm font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    {step.description && (
                                        <TooltipContent side="bottom" className="bg-gray-800 text-white text-xs p-2 rounded-md">
                                            <p>{step.description}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>

                                {/* Right Spacer or Connector */}
                                {orientation === "horizontal" && (
                                    isLast ? (
                                        <div className="h-1 flex-1 mx-2" /> // Spacer for last step
                                    ) : (
                                        <div
                                            className={cn(
                                                "h-1 flex-1",
                                                isCompleted || isCurrent ? "bg-emerald-500" : "bg-gray-200"
                                            )}
                                        />
                                    )
                                )}

                                {/* Vertical Connector (for vertical orientation) */}
                                {orientation === "vertical" && !isLast && (
                                    <div
                                        className={cn(
                                            "my-3 h-10 w-1",
                                            isCompleted || isCurrent ? "bg-emerald-500" : "bg-gray-200"
                                        )}
                                    />
                                )}
                            </div>

                            <div className={cn(orientation === "vertical" ? "flex-1 mt-1" : "text-center mt-2")}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p
                                            className={cn(
                                                "text-sm font-semibold transition-colors",
                                                isCompleted && "text-emerald-700",
                                                isCurrent && "text-blue-700",
                                                isPending && "text-gray-500"
                                            )}
                                        >
                                            {step.label}
                                        </p>
                                    </TooltipTrigger>
                                    {step.description && (
                                        <TooltipContent side="bottom" className="bg-gray-800 text-white text-xs p-2 rounded-md">
                                            <p>{step.description}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </div>
                        </div>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}

export type { StepperProps, StepperStep };