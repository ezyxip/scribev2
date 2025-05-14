"use client";

import { Cell } from "@/utils/cell-ui";
import { useState, useEffect, useCallback, useMemo } from "react";
import EditorTopBar from "./editor-top-bar";
import { Box, Container, Paper, TextField } from "@mui/material";
import { EditorBottomPanel } from "./editor-bottom-panel";
import { debounce } from "lodash-es";

export type EditorProps = {
    title: string;
    setTitle: (newTitle: string) => void;
    cells: Cell[];
    deleteCell(id: string): void;
    addCell(cell: Cell, type: string, index: number): void;
    updateCell?: (cellId: string, newContent: any) => Promise<void>;
};

export default function NotebookEditor(props: EditorProps) {
    const [cells, setCells] = useState(props.cells);
    const [focus, setFocus] = useState<string | null>(null);
    const [isBottomPanelOpen, setBottomPanelOpen] = useState(true);
    const [localTitle, setLocalTitle] = useState(props.title);
    const isPanelOpen = focus != null;

    // Синхронизация с внешними изменениями
    // useEffect(() => {
    //     setLocalTitle(props.title);
    //     setCells(props.cells);
    // }, [props.title, props.cells]);

    // Дебаунс для заголовка
    const debouncedSetTitle = useMemo(
        () => debounce(props.setTitle, 500),
        [props.setTitle]
    );

    // Дебаунс для ячеек (если передан updateCell)
    const debouncedUpdateCell = useMemo(
        () => (props.updateCell ? debounce(props.updateCell, 500) : null),
        [props.updateCell]
    );

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setLocalTitle(newTitle);
        debouncedSetTitle(newTitle);
    };

    const handleTitleBlur = () => {
        debouncedSetTitle.flush();
    };

    const changeState = useCallback(
        (id: string, newContent: any) => {
            setCells((prevCells) =>
                prevCells.map((cell) =>
                    cell.id === id ? { ...cell, state: newContent } : cell
                )
            );

            if (debouncedUpdateCell) {
                debouncedUpdateCell(id, newContent);
            }
        },
        [debouncedUpdateCell]
    );

    const commonState = useMemo(
        () =>
            cells.reduce((acc, cell) => {
                acc[cell.id] = cell.state;
                return acc;
            }, {} as Record<string, any>),
        [cells]
    );

    const setFocusHandler = (id: string) => {
        setFocus(id);
        setPanelIsOpen(true);
    };

    const disableFocusHandler = () => {
        setFocus(null);
        setPanelIsOpen(false);
    };

    const addCellHandler = (cell: Cell, type: string, index: number) => {
        const newCells = [...cells];
        newCells.splice(index, 0, { ...cell, id: crypto.randomUUID() });
        setCells(newCells);
        props.addCell(cell, type, index);
    };

    const deleteCellHandler = (id: string) => {
        const newCells = cells.filter((e) => e.id !== id);
        setCells(newCells);
        disableFocusHandler();
        props.deleteCell(id);
    };

    const setPanelIsOpen = (b: boolean) => {
        if (!b) {
            setFocus(null);
        }
    };

    const getState = (id: string) => commonState[id];

    const onCellClickHandler = (id: string) => {
        setFocusHandler(id);
    };

    const panel = focus ? (
        <EditorTopBar
            isVisible={true}
            onClose={() => setPanelIsOpen(false)}
            onDelete={() => deleteCellHandler(focus)}
            items={() => {
                const FocusedCell = cells.find((e) => e.id === focus)!;
                return (
                    <FocusedCell.TopPanelFilling
                        focus={true}
                        state={commonState[focus]}
                        changeState={(newContent) =>
                            changeState(focus, newContent)
                        }
                    />
                );
            }}
        />
    ) : (
        <EditorTopBar
            isVisible={false}
            items={() => <></>}
            onClose={() => {}}
            onDelete={() => {}}
        />
    );

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            debouncedSetTitle.cancel();
            debouncedUpdateCell?.cancel();
        };
    }, [debouncedSetTitle, debouncedUpdateCell]);

    return (
        <Container>
            {panel}
            <Box sx={{ height: "3em" }} />
            <TextField
                fullWidth
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                variant="outlined"
                placeholder="Название блокнота"
                sx={{ marginBottom: 3 }}
            />
            {cells.map((e) => (
                <Paper
                    sx={{
                        marginTop: 2,
                        padding: 2,
                        border:
                            e.id === focus
                                ? "1px solid #1976d2"
                                : "1px solid transparent",
                        transition: "border 0.2s ease-in-out",
                    }}
                    key={e.id}
                    onClick={() => onCellClickHandler(e.id)}
                    elevation={e.id === focus ? 3 : 1}
                >
                    <e.RenderInEditor
                        focus={e.id === focus}
                        state={getState(e.id)}
                        changeState={(newContent: any) =>
                            changeState(e.id, newContent)
                        }
                    />
                </Paper>
            ))}
            <Box sx={{ height: "50vh" }} />
            <EditorBottomPanel
                addCell={(c: Cell, type: string) =>
                    addCellHandler(c, type, cells.length)
                }
                isVisible={isBottomPanelOpen}
            />
        </Container>
    );
}
