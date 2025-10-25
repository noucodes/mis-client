"use client"

import { createId } from '@paralleldrive/cuid2';
import { KanbanBoard, KanbanBoardCard, KanbanBoardCardButton, KanbanBoardCardButtonGroup, KanbanBoardCardDescription, KanbanBoardCardTextarea, KanbanBoardCircleColor, KanbanBoardColumn, KanbanBoardColumnButton, kanbanBoardColumnClassNames, KanbanBoardColumnFooter, KanbanBoardColumnHeader, KanbanBoardColumnIconButton, KanbanBoardColumnList, KanbanBoardColumnListItem, kanbanBoardColumnListItemClassNames, KanbanBoardColumnSkeleton, KanbanBoardColumnTitle, KanbanBoardDropDirection, KanbanBoardExtraMargin, KanbanBoardProvider, KanbanColorCircle, useDndEvents } from "@/components/recruitment-management/applicants/kanban";
import { useJsLoaded } from "@/hooks/use-js-loaded";
import { Check, X, ArrowLeft, PlusIcon } from "lucide-react";
import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import { flushSync } from "react-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { StageApplicantButton } from "@/components/recruitment-management/applicants/stage-application-button";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from 'axios';

// Define Applicant type
interface Applicant {
    applicant_id: number;
    full_name: string;
    application_status: string;
}

// Types
type Card = {
    id: string;
    title: string;
};

type Column = {
    id: string;
    title: string;
    color: KanbanBoardCircleColor;
    items: Card[];
};

export function Kanban() {
    return (
        <KanbanBoardProvider>
            <MyKanbanBoard />
        </KanbanBoardProvider>
    )
}

export function MyKanbanBoard() {
    const [columns, setColumns] = useState<Column[]>([]);

    useEffect(() => {
        async function fetchApplicants() {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                if (!token) {
                    console.error("No token found, cannot fetch applicants");
                    return;
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!apiUrl) {
                    console.error("API URL is not defined");
                    return;
                }

                const response = await axios.get<Applicant[]>(`${apiUrl}/applicants`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = response.data;

                if (!Array.isArray(data)) {
                    console.error("Expected array, got:", data);
                    return;
                }
                console.log("API response:", data);
                console.log("Unique statuses from API:", [...new Set(data.map((applicant) => applicant.application_status))]);

                const grouped: { [application_status: string]: Card[] } = {};

                data.forEach((applicant) => {
                    if (!applicant.applicant_id || !applicant.full_name || !applicant.application_status) {
                        console.warn("Invalid applicant data:", applicant);
                        return;
                    }
                    const status = applicant.application_status;
                    if (!grouped[status]) grouped[status] = [];
                    grouped[status].push({
                        id: String(applicant.applicant_id),
                        title: applicant.full_name,
                    });
                });

                console.log("Grouped statuses:", Object.keys(grouped));

                const possibleStatuses: { id: string; title: string; color: KanbanBoardCircleColor }[] = [
                    { id: "1", title: "Initial Interview", color: "gray" },
                    { id: "2", title: "Examination", color: "red" },
                    { id: "3", title: "Final Interview", color: "yellow" },
                    { id: "4", title: "Job Offer", color: "green" },
                    { id: "5", title: "Contract Signing", color: "blue" },
                ];

                possibleStatuses.forEach((status) => {
                    if (!grouped[status.title]) {
                        console.log(`No applicants found for status: ${status.title}`);
                    }
                });

                setColumns(
                    possibleStatuses.map((status) => ({
                        ...status,
                        items: grouped[status.title] || [],
                    }))
                );
            } catch (error) {
                if (error instanceof AxiosError) {
                    console.error("Error fetching applicants:", error.response?.data || error.message);
                } else {
                    console.error("Unexpected error:", error);
                }
            }
        }

        fetchApplicants();
    }, []);

    // Scroll to the right when a new column is added.
    const scrollContainerReference = useRef<HTMLDivElement>(null);

    function scrollRight() {
        if (scrollContainerReference.current) {
            scrollContainerReference.current.scrollLeft =
                scrollContainerReference.current.scrollWidth;
        }
    }

    /*
    Card logic
    */

    function handleAddCard(columnId: string, cardContent: string) {
        setColumns(previousColumns =>
            previousColumns.map(column =>
                column.id === columnId
                    ? {
                        ...column,
                        items: [...column.items, { id: createId(), title: cardContent }],
                    }
                    : column,
            ),
        );
    }

    function handleMoveCardToColumn(columnId: string, index: number, card: Card) {
        setColumns(previousColumns =>
            previousColumns.map(column => {
                if (column.id === columnId) {
                    // Remove the card from the column (if it exists) before reinserting it.
                    const updatedItems = column.items.filter(({ id }) => id !== card.id);
                    return {
                        ...column,
                        items: [
                            // Items before the insertion index.
                            ...updatedItems.slice(0, index),
                            // Insert the card.
                            card,
                            // Items after the insertion index.
                            ...updatedItems.slice(index),
                        ],
                    };
                } else {
                    // Remove the card from other columns.
                    return {
                        ...column,
                        items: column.items.filter(({ id }) => id !== card.id),
                    };
                }
            }),
        );
    }

    /*
    Moving cards with the keyboard.
    */
    const [activeCardId, setActiveCardId] = useState<string>('');
    const originalCardPositionReference = useRef<{
        columnId: string;
        cardIndex: number;
    } | null>(null);
    const { onDragStart, onDragEnd, onDragCancel, onDragOver } = useDndEvents();

    // This helper returns the appropriate overId after a card is placed.
    // If there's another card below, return that card's id, otherwise return the column's id.
    function getOverId(column: Column, cardIndex: number): string {
        if (cardIndex < column.items.length - 1) {
            return column.items[cardIndex + 1].id;
        }

        return column.id;
    }

    // Find column and index for a given card.
    function findCardPosition(cardId: string): {
        columnIndex: number;
        cardIndex: number;
    } {
        for (const [columnIndex, column] of columns.entries()) {
            const cardIndex = column.items.findIndex(c => c.id === cardId);

            if (cardIndex !== -1) {
                return { columnIndex, cardIndex };
            }
        }

        return { columnIndex: -1, cardIndex: -1 };
    }

    function moveActiveCard(
        cardId: string,
        direction: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown',
    ) {
        const { columnIndex, cardIndex } = findCardPosition(cardId);
        if (columnIndex === -1 || cardIndex === -1) return;

        const card = columns[columnIndex].items[cardIndex];

        let newColumnIndex = columnIndex;
        let newCardIndex = cardIndex;

        switch (direction) {
            case 'ArrowUp': {
                newCardIndex = Math.max(cardIndex - 1, 0);

                break;
            }
            case 'ArrowDown': {
                newCardIndex = Math.min(
                    cardIndex + 1,
                    columns[columnIndex].items.length - 1,
                );

                break;
            }
            case 'ArrowLeft': {
                newColumnIndex = Math.max(columnIndex - 1, 0);
                // Keep same cardIndex if possible, or if out of range, insert at end
                newCardIndex = Math.min(
                    newCardIndex,
                    columns[newColumnIndex].items.length,
                );

                break;
            }
            case 'ArrowRight': {
                newColumnIndex = Math.min(columnIndex + 1, columns.length - 1);
                newCardIndex = Math.min(
                    newCardIndex,
                    columns[newColumnIndex].items.length,
                );

                break;
            }
        }

        // Perform state update in flushSync to ensure immediate state update.
        flushSync(() => {
            handleMoveCardToColumn(columns[newColumnIndex].id, newCardIndex, card);
        });

        // Find the card's new position and announce it.
        const { columnIndex: updatedColumnIndex, cardIndex: updatedCardIndex } =
            findCardPosition(cardId);
        const overId = getOverId(columns[updatedColumnIndex], updatedCardIndex);

        onDragOver(cardId, overId);
    }

    function handleCardKeyDown(
        event: React.KeyboardEvent<HTMLButtonElement>,
        cardId: string,
    ) {
        const { key } = event;

        if (activeCardId === '' && key === ' ') {
            // Pick up the card.
            event.preventDefault();
            setActiveCardId(cardId);
            onDragStart(cardId);

            const { columnIndex, cardIndex } = findCardPosition(cardId);
            originalCardPositionReference.current =
                columnIndex !== -1 && cardIndex !== -1
                    ? { columnId: columns[columnIndex].id, cardIndex }
                    : null;
        } else if (activeCardId === cardId) {
            // Card is already active.
            // eslint-disable-next-line unicorn/prefer-switch
            if (key === ' ' || key === 'Enter') {
                event.preventDefault();
                // Drop the card.
                flushSync(() => {
                    setActiveCardId('');
                });

                const { columnIndex, cardIndex } = findCardPosition(cardId);
                if (columnIndex !== -1 && cardIndex !== -1) {
                    const overId = getOverId(columns[columnIndex], cardIndex);
                    onDragEnd(cardId, overId);
                } else {
                    // If we somehow can't find the card, just call onDragEnd with cardId.
                    onDragEnd(cardId);
                }

                originalCardPositionReference.current = null;
            } else if (key === 'Escape') {
                event.preventDefault();

                // Cancel the drag.
                if (originalCardPositionReference.current) {
                    const { columnId, cardIndex } = originalCardPositionReference.current;
                    const {
                        columnIndex: currentColumnIndex,
                        cardIndex: currentCardIndex,
                    } = findCardPosition(cardId);

                    // Revert card only if it moved.
                    if (
                        currentColumnIndex !== -1 &&
                        (columnId !== columns[currentColumnIndex].id ||
                            cardIndex !== currentCardIndex)
                    ) {
                        const card = columns[currentColumnIndex].items[currentCardIndex];
                        flushSync(() => {
                            handleMoveCardToColumn(columnId, cardIndex, card);
                        });
                    }
                }

                onDragCancel(cardId);
                originalCardPositionReference.current = null;

                setActiveCardId('');
            } else if (
                key === 'ArrowLeft' ||
                key === 'ArrowRight' ||
                key === 'ArrowUp' ||
                key === 'ArrowDown'
            ) {
                event.preventDefault();
                moveActiveCard(cardId, key);
                // onDragOver is called inside moveActiveCard after placement.
            }
        }
    }

    function handleCardBlur() {
        setActiveCardId('');
    }

    const jsLoaded = useJsLoaded();

    return (
        <KanbanBoard ref={scrollContainerReference}>
            {columns.map(column =>
                jsLoaded ? (
                    <MyKanbanBoardColumn
                        activeCardId={activeCardId}
                        column={column}
                        key={column.id}
                        onAddCard={handleAddCard}
                        onCardBlur={handleCardBlur}
                        onCardKeyDown={handleCardKeyDown}
                        onMoveCardToColumn={handleMoveCardToColumn}
                        columns={columns}
                        findCardPosition={findCardPosition}
                    />
                ) : (
                    <KanbanBoardColumnSkeleton key={column.id} />
                ),
            )}

            <KanbanBoardExtraMargin />
        </KanbanBoard>
    );
}

export function MyKanbanBoardColumn({
    activeCardId,
    column,
    onAddCard,
    onCardBlur,
    onCardKeyDown,
    onMoveCardToColumn,
    columns,
    findCardPosition,
}: {
    activeCardId: string;
    column: Column;
    onAddCard: (columnId: string, cardContent: string) => void;
    onCardBlur: () => void;
    onCardKeyDown: (
        event: React.KeyboardEvent<HTMLButtonElement>,
        cardId: string,
    ) => void;
    onMoveCardToColumn: (columnId: string, index: number, card: Card) => void;
    columns: Column[];
    findCardPosition: (cardId: string) => { columnIndex: number; cardIndex: number };
}) {
    const listReference = useRef<HTMLUListElement>(null);
    const moreOptionsButtonReference = useRef<HTMLButtonElement>(null);
    const { onDragCancel, onDragEnd } = useDndEvents();

    function scrollList() {
        if (listReference.current) {
            listReference.current.scrollTop = listReference.current.scrollHeight;
        }
    }

    function handleDropOverColumn(dataTransferData: string) {
        const card = JSON.parse(dataTransferData) as Card;

        const { columnIndex: sourceIndex } = findCardPosition(card.id);
        const targetIndex = columns.findIndex(c => c.id === column.id);

        // Allow drop if target is the immediate previous OR next column
        if (targetIndex === sourceIndex + 1 || targetIndex === sourceIndex - 1) {
            onMoveCardToColumn(column.id, 0, card);
        }
    }

    function handleDropOverListItem(cardId: string) {
        return (
            dataTransferData: string,
            dropDirection: KanbanBoardDropDirection,
        ) => {
            const card = JSON.parse(dataTransferData) as Card;

            const { columnIndex: sourceIndex } = findCardPosition(card.id);
            const targetIndex = columns.findIndex(c => c.id === column.id);

            // Only use drop if adjacent
            if (targetIndex === sourceIndex + 1) {
                const cardIndex = column.items.findIndex(({ id }) => id === cardId);
                const baseIndex = dropDirection === 'top' ? cardIndex : cardIndex + 1;
                const safeTargetIndex = Math.max(
                    0,
                    Math.min(baseIndex, column.items.length),
                );

                const overCard = column.items[safeTargetIndex];
                onMoveCardToColumn(column.id, safeTargetIndex, card);
                onDragEnd(card.id, overCard?.id || column.id);
            }
        };
    }


    return (
        <KanbanBoardColumn
            columnId={column.id}
            key={column.id}
            onDropOverColumn={handleDropOverColumn}
        >
            <KanbanBoardColumnHeader>
                <KanbanBoardColumnTitle columnId={column.id}>
                    <KanbanColorCircle color={column.color} />
                    {column.title}
                </KanbanBoardColumnTitle>
            </KanbanBoardColumnHeader>

            <KanbanBoardColumnList ref={listReference}>
                {column.items.map(card => (
                    <KanbanBoardColumnListItem
                        cardId={card.id}
                        key={card.id}
                        onDropOverListItem={handleDropOverListItem(card.id)}
                    >
                        <MyKanbanBoardCard
                            card={card}
                            isActive={activeCardId === card.id}
                            onCardBlur={onCardBlur}
                            onCardKeyDown={onCardKeyDown}
                            onMoveCardToColumn={onMoveCardToColumn}
                            columns={columns}
                            findCardPosition={findCardPosition}
                        />

                    </KanbanBoardColumnListItem>
                ))}
            </KanbanBoardColumnList>
            {/* Uncomment to enable adding new cards */}
            {/* <MyNewKanbanBoardCard column={column} onAddCard={onAddCard} scrollList={scrollList} /> */}
        </KanbanBoardColumn>
    );
}

export function MyKanbanBoardCard({
    card,
    isActive,
    onCardBlur,
    onCardKeyDown,
    onMoveCardToColumn,
    columns,
    findCardPosition,
}: {
    card: Card;
    isActive: boolean;
    onCardBlur: () => void;
    onCardKeyDown: (
        event: React.KeyboardEvent<HTMLButtonElement>,
        cardId: string,
    ) => void;
    onMoveCardToColumn: (columnId: string, index: number, card: Card) => void;
    columns: Column[];
    findCardPosition: (cardId: string) => { columnIndex: number; cardIndex: number };
}) {
    const kanbanBoardCardReference = useRef<HTMLButtonElement>(null);
    const { onDragEnd } = useDndEvents();
    const [isNextStageOpen, setIsNextStageOpen] = useState(false);
    const [isPreviousStageOpen, setIsPreviousStageOpen] = useState(false);

    function moveToNextColumn() {
        const { columnIndex } = findCardPosition(card.id);
        if (columnIndex === -1 || columnIndex === columns.length - 1) return;

        const nextColumn = columns[columnIndex + 1];
        onMoveCardToColumn(nextColumn.id, nextColumn.items.length, card);
        onDragEnd(card.id, nextColumn.id);
    }

    function moveToPreviousColumn() {
        const { columnIndex } = findCardPosition(card.id);
        if (columnIndex === -1 || columnIndex === 0) return;

        const previousColumn = columns[columnIndex - 1];
        onMoveCardToColumn(previousColumn.id, previousColumn.items.length, card);
        onDragEnd(card.id, previousColumn.id);
    }

    return (
        <KanbanBoardCard
            data={card}
            isActive={isActive}
            onBlur={onCardBlur}
            onKeyDown={(e) => onCardKeyDown(e, card.id)}
            ref={kanbanBoardCardReference}
        >
            <KanbanBoardCardDescription>{card.title}</KanbanBoardCardDescription>
            {columns[columns.length - 1].items.includes(card) ? (
                <KanbanBoardCardButtonGroup disabled={isActive}>
                    <KanbanBoardCardButton tooltip="Move to Onboarding Process Pipeline">
                        <Check />
                        <span className="sr-only">Onboarding</span>
                    </KanbanBoardCardButton>
                </KanbanBoardCardButtonGroup>
            ) : (
                <KanbanBoardCardButtonGroup disabled={isActive} className='gap-2'>
                    <ResponsiveDialog
                        isOpen={isPreviousStageOpen}
                        setIsOpen={setIsPreviousStageOpen}
                        title="Previous Stage"
                        description={`Provide comments and feedback for moving ${card.title} to the previous stage.`}
                    >
                        <StageApplicantButton
                            id={card.id}
                            applicationStatus={columns[findCardPosition(card.id).columnIndex].title}
                            direction="previous"
                            onStage={() => {
                                setIsPreviousStageOpen(false);
                                moveToPreviousColumn();
                            }}
                        />
                    </ResponsiveDialog>
                    <ResponsiveDialog
                        isOpen={isNextStageOpen}
                        setIsOpen={setIsNextStageOpen}
                        title="Next Stage"
                        description={`Provide comments and feedback for moving ${card.title} to the next stage.`}
                    >
                        <StageApplicantButton
                            id={card.id}
                            applicationStatus={columns[findCardPosition(card.id).columnIndex].title}
                            direction="next"
                            onStage={() => {
                                setIsNextStageOpen(false);
                                moveToNextColumn();
                            }}
                        />
                    </ResponsiveDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <KanbanBoardCardButton
                                className="text-destructive"
                                tooltip="Reject"
                            >
                                <X />
                                <span className="sr-only">Reject</span>
                            </KanbanBoardCardButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to reject this applicant?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. This will permanently delete your applicant in our servers.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Reject</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </KanbanBoardCardButtonGroup>
            )}
        </KanbanBoardCard >
    );
}

function MyNewKanbanBoardCard({
    column,
    onAddCard,
    scrollList,
}: {
    column: Column;
    onAddCard: (columnId: string, cardContent: string) => void;
    scrollList: () => void;
}) {
    const [cardContent, setCardContent] = useState('');
    const newCardButtonReference = useRef<HTMLButtonElement>(null);
    const submitButtonReference = useRef<HTMLButtonElement>(null);
    const [showNewCardForm, setShowNewCardForm] = useState(false);

    function handleAddCardClick() {
        flushSync(() => {
            setShowNewCardForm(true);
        });

        scrollList();
    }

    function handleCancelClick() {
        flushSync(() => {
            setShowNewCardForm(false);
            setCardContent('');
        });

        newCardButtonReference.current?.focus();
    }

    function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setCardContent(event.currentTarget.value);
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        flushSync(() => {
            onAddCard(column.id, cardContent.trim());
            setCardContent('');
        });

        scrollList();
    }

    return showNewCardForm ? (
        <>
            <form
                onBlur={event => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        handleCancelClick();
                    }
                }}
                onSubmit={handleSubmit}
            >
                <div className={kanbanBoardColumnListItemClassNames}>
                    <KanbanBoardCardTextarea
                        aria-label="New card content"
                        autoFocus
                        name="cardContent"
                        onChange={handleInputChange}
                        onInput={event => {
                            const input = event.currentTarget as HTMLTextAreaElement;
                            if (/\S/.test(input.value)) {
                                // Clear the error message if input is valid
                                input.setCustomValidity('');
                            } else {
                                input.setCustomValidity(
                                    'Card content cannot be empty or just whitespace.',
                                );
                            }
                        }}
                        onKeyDown={event => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                submitButtonReference.current?.click();
                            }

                            if (event.key === 'Escape') {
                                handleCancelClick();
                            }
                        }}
                        placeholder="New post ..."
                        required
                        value={cardContent}
                    />
                </div>

                <KanbanBoardColumnFooter>
                    <Button ref={submitButtonReference} size="sm" type="submit">
                        Add
                    </Button>

                    <Button
                        onClick={handleCancelClick}
                        size="sm"
                        variant="outline"
                        type="button"
                    >
                        Cancel
                    </Button>
                </KanbanBoardColumnFooter>
            </form>
        </>
    ) : (
        <KanbanBoardColumnFooter>
            <KanbanBoardColumnButton
                onClick={handleAddCardClick}
                ref={newCardButtonReference}
            >
                <PlusIcon />

                <span aria-hidden>New Applicant</span>

                <span className="sr-only">Add new card to {column.title}</span>
            </KanbanBoardColumnButton>
        </KanbanBoardColumnFooter>
    );
}