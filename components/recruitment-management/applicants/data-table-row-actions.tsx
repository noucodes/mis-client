'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Row } from '@tanstack/react-table';
import { Check, ChevronLeft, ChevronRight, Eye, MoreHorizontal, XCircle } from 'lucide-react';
import { RejectApplicantButton } from './reject-application-button';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { StageApplicantButton } from './stage-application-button';
import { StatusDialog } from './details-dialog';

interface WithId<T> {
    applicant_id: string;
    application_status: string;
    employment_status: string;
    full_name: string;
    position_applied: string;
}

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
}

export function DataTableRowActions<TData extends WithId<string>>({
    row,
}: DataTableRowActionsProps<TData>) {
    const [isNextStageOpen, setIsNextStageOpen] = useState(false);
    const [isPreviousStageOpen, setIsPreviousStageOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const applicantId = row.original.applicant_id as string;
    const isRejected = row.original.employment_status === 'Rejected';
    const isHired = row.original.application_status === 'Hired';
    const isInitial = row.original.application_status === 'Initial Interview';

    return (
        <>
            {/* Reject / Restore dialog */}
            <ResponsiveDialog
                isOpen={isRejectOpen}
                setIsOpen={setIsRejectOpen}
                title={isRejected ? 'Restore Applicant' : 'Reject Applicant'}
                description={
                    isRejected
                        ? 'Are you sure you want to restore this applicant?'
                        : 'Are you sure you want to reject this applicant?'
                }
            >
                <RejectApplicantButton
                    id={applicantId}
                    onReject={() => setIsRejectOpen(false)}
                />
            </ResponsiveDialog>

            {/* Stage forward */}
            <ResponsiveDialog
                isOpen={isNextStageOpen}
                setIsOpen={setIsNextStageOpen}
                title="Next Stage"
                description="Provide comments and feedback for the next stage."
            >
                <StageApplicantButton
                    id={applicantId}
                    applicationStatus={row.original.application_status}
                    direction="next"
                    onStage={() => setIsNextStageOpen(false)}
                />
            </ResponsiveDialog>

            {/* Stage backward */}
            <ResponsiveDialog
                isOpen={isPreviousStageOpen}
                setIsOpen={setIsPreviousStageOpen}
                title="Previous Stage"
                description="Provide comments and feedback for the previous stage."
            >
                <StageApplicantButton
                    id={applicantId}
                    applicationStatus={row.original.application_status}
                    direction="previous"
                    onStage={() => setIsPreviousStageOpen(false)}
                />
            </ResponsiveDialog>

            {/* Applicant details */}
            <StatusDialog open={isStatusOpen} onOpenChange={setIsStatusOpen} applicantId={applicantId} />

            {/* Dropdown Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px] z-50">
                    {/* ✅ Next Stage */}
                    {!isHired && !isRejected && (
                        <DropdownMenuItem disabled={isLoading} onClick={() => setIsNextStageOpen(true)}>
                            <ChevronRight className="h-4 w-4" />
                            Next Stage
                        </DropdownMenuItem>
                    )}

                    {/* ✅ Previous Stage */}
                    {!isInitial && !isRejected && (
                        <DropdownMenuItem disabled={isLoading} onClick={() => setIsPreviousStageOpen(true)}>
                            <ChevronLeft className="h-4 w-4" />
                            Previous Stage
                        </DropdownMenuItem>
                    )}

                    {/* ✅ Reject or Restore */}
                    {!isHired && (
                        <DropdownMenuItem
                            disabled={isLoading}
                            onClick={() => setIsRejectOpen(true)}
                        >
                            {isRejected ? (
                                <>
                                    <Check className="h-4 w-4 text-green-500" />
                                    Restore Applicant
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    Reject
                                </>
                            )}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* ✅ View Details */}
                    <DropdownMenuItem disabled={isLoading} onClick={() => setIsStatusOpen(true)}>
                        <Eye className="h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
import * as React from "react";