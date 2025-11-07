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
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Eye,
    MoreHorizontal,
    XCircle,
    UserCheck,
    Ban,
    CircleSlash,
} from 'lucide-react';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { StageApplicantButton } from './stage-application-button';
import { StatusDialog } from './details-dialog';
import { StatusActionButton } from './status-action-button';

interface WithId<T> {
    applicant_id: string;
    application_status: string;
    employment_status: string;
    first_name: string;
    last_name: string;
    position_applied: string;
    examination_code: string;
}

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
}

/* ------------------------------------------------------------------ */
/*  All possible terminal statuses                                            */
/* ------------------------------------------------------------------ */
type TerminalStatus = 'Shortlisted' | 'Blocklisted' | 'Not Qualified' | 'Rejected';

interface TerminalConfig {
    status: TerminalStatus;
    setOpen: (open: boolean) => void;
    label: string;               // e.g. "Shortlist"
    icon: React.ElementType;
    color: string;
}

export function DataTableRowActions<TData extends WithId<string>>({
    row,
}: DataTableRowActionsProps<TData>) {
    /* --------------------------- state --------------------------- */
    const [isNextStageOpen, setIsNextStageOpen] = useState(false);
    const [isPreviousStageOpen, setIsPreviousStageOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const [isShortlistOpen, setIsShortlistOpen] = useState(false);
    const [isBlocklistOpen, setIsBlocklistOpen] = useState(false);
    const [isNotQualifiedOpen, setIsNotQualifiedOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    /* --------------------------- data --------------------------- */
    const applicantId = row.original.applicant_id as string;
    const examinationId = row.original.examination_code as string;
    const employmentStatus = row.original.employment_status as string;
    const applicationStatus = row.original.application_status as string;

    const isHired = applicationStatus === 'Hired';
    const isInitial = applicationStatus === 'Initial Interview';

    const TERMINAL_STATUSES: TerminalStatus[] = [
        'Shortlisted',
        'Blocklisted',
        'Not Qualified',
        'Rejected',
    ];
    const isTerminal = TERMINAL_STATUSES.includes(employmentStatus as TerminalStatus);

    /* ---------------------- terminal config ---------------------- */
    const terminalActions: TerminalConfig[] = [
        {
            status: 'Shortlisted',
            setOpen: setIsShortlistOpen,
            label: 'Shortlist',
            icon: UserCheck,
            color: 'text-green-600',
        },
        {
            status: 'Blocklisted',
            setOpen: setIsBlocklistOpen,
            label: 'Blocklist',
            icon: Ban,
            color: 'text-red-600',
        },
        {
            status: 'Not Qualified',
            setOpen: setIsNotQualifiedOpen,
            label: 'Not Qualified',
            icon: CircleSlash,
            color: 'text-orange-600',
        },
        {
            status: 'Rejected',
            setOpen: setIsRejectOpen,
            label: 'Reject',
            icon: XCircle,
            color: 'text-red-600',
        },
    ];

    /* ------------------- dialog title / desc ------------------- */
    const dialogTitle = (status: TerminalStatus) => {
        const isCurrent = employmentStatus === status;
        return isCurrent ? 'Restore Applicant' : `${status === 'Rejected' ? 'Reject' : status} Applicant`;
    };

    const dialogDesc = (status: TerminalStatus) => {
        const isCurrent = employmentStatus === status;
        const map: Record<TerminalStatus, string> = {
            Shortlisted: 'Mark this applicant as shortlisted.',
            Blocklisted: 'Prevent this applicant from applying again.',
            'Not Qualified': 'This applicant does not meet the requirements.',
            Rejected: 'Permanently reject this applicant.',
        };
        return isCurrent ? 'Restore this applicant back to the pool.' : map[status];
    };

    /* ------------------- find current action ------------------- */
    const currentAction = terminalActions.find(a => a.status === employmentStatus);

    return (
        <>
            {/* ====================== DIALOGS ====================== */}

            {/* ---- Stage dialogs (only when NOT terminal) ---- */}
            {!isTerminal && (
                <>
                    <ResponsiveDialog
                        isOpen={isNextStageOpen}
                        setIsOpen={setIsNextStageOpen}
                        title="Next Stage"
                        description="Provide comments and feedback for the next stage."
                    >
                        <StageApplicantButton
                            id={applicantId}
                            applicationStatus={applicationStatus}
                            direction="next"
                            onStage={() => setIsNextStageOpen(false)}
                        />
                    </ResponsiveDialog>

                    <ResponsiveDialog
                        isOpen={isPreviousStageOpen}
                        setIsOpen={setIsPreviousStageOpen}
                        title="Previous Stage"
                        description="Provide comments and feedback for the previous stage."
                    >
                        <StageApplicantButton
                            id={applicantId}
                            applicationStatus={applicationStatus}
                            direction="previous"
                            onStage={() => setIsPreviousStageOpen(false)}
                        />
                    </ResponsiveDialog>
                </>
            )}

            {/* ---- Terminal‑status dialogs (apply / restore) ---- */}
            {terminalActions.map(({ status, setOpen }) => {
                const openState = {
                    Shortlisted: isShortlistOpen,
                    Blocklisted: isBlocklistOpen,
                    'Not Qualified': isNotQualifiedOpen,
                    Rejected: isRejectOpen,
                }[status];
                const setOpenState = {
                    Shortlisted: setIsShortlistOpen,
                    Blocklisted: setIsBlocklistOpen,
                    'Not Qualified': setIsNotQualifiedOpen,
                    Rejected: setIsRejectOpen,
                }[status];

                return (
                    <ResponsiveDialog
                        key={status}
                        isOpen={openState}
                        setIsOpen={setOpenState}
                        title={dialogTitle(status)}
                        description={dialogDesc(status)}
                    >
                        <StatusActionButton
                            id={applicantId}
                            targetStatus={status}
                            onSuccess={() => setOpenState(false)}
                        />
                    </ResponsiveDialog>
                );
            })}

            {/* ---- Details dialog ---- */}
            <StatusDialog
                open={isStatusOpen}
                onOpenChange={setIsStatusOpen}
                applicantId={applicantId}
                examinationId={examinationId}
            />

            {/* ====================== DROPDOWN MENU ====================== */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-[200px] z-50">
                    {/* ----- ONLY when NOT in a terminal state ----- */}
                    {!isTerminal && (
                        <>
                            {!isHired && (
                                <DropdownMenuItem onClick={() => setIsNextStageOpen(true)}>
                                    <ChevronRight className="h-4 w-4 mr-2" />
                                    Next Stage
                                </DropdownMenuItem>
                            )}
                            {!isInitial && (
                                <DropdownMenuItem onClick={() => setIsPreviousStageOpen(true)}>
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Previous Stage
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                        </>
                    )}

                    {/* ----- TERMINAL ACTIONS ----- */}
                    {isTerminal ? (
                        /* ---- ONLY the current terminal status → Restore ---- */
                        <DropdownMenuItem
                            onClick={() => currentAction?.setOpen(true)}
                            className="text-green-600"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Restore Applicant
                        </DropdownMenuItem>
                    ) : (
                        /* ---- All four actions when NOT terminal ---- */
                        <>
                            {terminalActions.map(({ status, setOpen, label, icon: Icon, color }) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => setOpen(true)}
                                    className={color}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}

                    <DropdownMenuSeparator />

                    {/* ---- View Details (always) ---- */}
                    <DropdownMenuItem onClick={() => setIsStatusOpen(true)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}