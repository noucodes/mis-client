'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Row } from '@tanstack/react-table';
import {
    Eye,
    MoreHorizontal,
} from 'lucide-react';
import { ExaminationAssessmentDialog } from './assessment-details-dialog';

interface WithId<T> {
    applicant_id: string;
    first_name: string;
    last_name: string;
    position_applied: string;
    examination_code: string;
}

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
}

export function DataTableRowActions<TData extends WithId<string>>({
    row,
}: DataTableRowActionsProps<TData>) {
    const [assessOpen, setAssessOpen] = useState(false);

    /* --------------------------- data --------------------------- */
    const applicantId = row.original.applicant_id as string;
    const examinationId = row.original.examination_code as string;

    return (
        <>
            {/* ---- Details dialog ---- */}
            <ExaminationAssessmentDialog
                open={assessOpen}
                onOpenChange={setAssessOpen}
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
                    {/* ---- View Details (always) ---- */}
                    <DropdownMenuItem onClick={() => setAssessOpen(true)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}