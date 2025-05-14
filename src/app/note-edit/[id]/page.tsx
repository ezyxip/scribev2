"use client";

import { useCellApi } from "@/wrappers/cell-api-wrapper";
import { useNotebookApi } from "@/wrappers/UseNotebookApiWrapper";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import LoadingSpinner from "@/components/loader-mock";
import { Box, Container, Typography } from "@mui/material";
import ModalErrorAlert from "@/components/modal-error-alert";
import { Notebook } from "@/api/notebook-api";
import { useNotebookExtApi } from "@/wrappers/notebook-ext-api-wrapper";
import { Cell as UICell } from "@/utils/cell-ui";
import { Cell as RawCell } from "@/api/cell-api";
import { useCellTypes } from "@/wrappers/cell-types-wrapper";
import { converterCellsWithoutHooks } from "@/utils/cell-converter";
import NotebookEditor from "@/components/notebook-editor";

export default function NotebookPage() {
    const params = useParams();
    const notebookId = params!.id as string;
    const notebookApi = useNotebookExtApi();
    const cellApi = useCellApi();

    const [notebook, setNotebook] = useState<Notebook | null>(null);
    const cellTypes = useCellTypes();
    const [uiCells, setUICells] = useState<UICell[]>([]);
    const rawCellsRef = useRef<RawCell[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleUpdateCell = useCallback(
        async (cellId: string, newContent: any) => {
            try {
                const cellToUpdate = rawCellsRef.current.find(
                    (c) => c.id === cellId
                );
                if (!cellToUpdate) return;

                const updatedCell = {
                    ...cellToUpdate,
                    content: newContent,
                };

                await cellApi.update(notebookId, updatedCell);
                rawCellsRef.current = rawCellsRef.current.map((c) =>
                    c.id === cellId ? updatedCell : c
                );
            } catch (err) {
                console.error("Failed to update cell:", err);
                setError("Не удалось обновить ячейку");
            }
        },
        [notebookId, cellApi]
    );

    // Загрузка данных блокнота и ячеек
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Загружаем блокнот
                const notebookData = await notebookApi.getOne(notebookId);
                setNotebook(notebookData);

                // Загружаем ячейки
                const cellsData = await cellApi.get(notebookId);
                rawCellsRef.current = cellsData; // Сохраняем сырые ячейки в ref
                setUICells(converterCellsWithoutHooks(cellsData, cellTypes));
            } catch (err) {
                console.error("Failed to load notebook:", err);
                setError("Не удалось загрузить блокнот");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [notebookId, notebookApi, cellApi]);

    // Конвертер UI ячеек в Raw
    const convertUICellToRaw = (uiCell: UICell): RawCell => {
        const originalRaw = rawCellsRef.current.find((c) => c.id === uiCell.id);
        return {
            id: uiCell.id,
            type: originalRaw?.type || "", // Берем тип из оригинальных данных
            content: uiCell.state,
            order: uiCells.findIndex((c) => c.id === uiCell.id), // Определяем порядок
        };
    };

    // Обработчики для NotebookEditor
    const handleTitleChange = async (newTitle: string) => {
        if (!notebook) {
            console.log("Notebook not found");
            return;
        }

        try {
            await notebookApi.update({
                ...notebook,
                title: newTitle,
            });
            setNotebook({ ...notebook, title: newTitle });
        } catch (err) {
            console.error("Failed to update title:", err);
            setError("Не удалось обновить заголовок");
        }
    };

    const handleAddCell = async (cell: UICell, type: string, index: number) => {
        try {
            const newRawCell: RawCell = {
                id: cell.id,
                type: type,
                content: cell.state,
                order: index,
            };

            let { id } = await cellApi.create(notebookId, newRawCell);
            newRawCell.id = id;
            const newCell = converterCellsWithoutHooks(
                [newRawCell],
                cellTypes
            )[0];
            // Обновляем оба состояния
            rawCellsRef.current = [...rawCellsRef.current, newRawCell];
            setUICells((prev) => {
                const newCells = [...prev];
                newCells.splice(index, 0, newCell);
                return newCells;
            });
        } catch (err) {
            console.error("Failed to add cell:", err);
            setError("Не удалось добавить ячейку");
        }
    };

    const handleDeleteCell = async (cellId: string) => {
        try {
            await cellApi.delete(notebookId, cellId);

            // Обновляем оба состояния
            rawCellsRef.current = rawCellsRef.current.filter(
                (c) => c.id !== cellId
            );
            setUICells((prev) => prev.filter((cell) => cell.id !== cellId));
        } catch (err) {
            console.error("Failed to delete cell:", err);
            setError("Не удалось удалить ячейку");
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md">
                <Box display="flex" justifyContent="center" mt={10}>
                    <LoadingSpinner />
                </Box>
            </Container>
        );
    }

    if (!notebook) {
        return (
            <Container maxWidth="md">
                <Typography
                    variant="h6"
                    color="error"
                    textAlign="center"
                    mt={4}
                >
                    Блокнот не найден
                </Typography>
            </Container>
        );
    }

    return (
        <NotebookEditor
            title={notebook.title}
            setTitle={handleTitleChange}
            cells={uiCells}
            addCell={handleAddCell}
            deleteCell={handleDeleteCell}
            updateCell={handleUpdateCell} // Передаем обработчик обновления
        />
    );
}
