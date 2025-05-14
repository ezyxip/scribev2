"use client";

import { useCellApi } from "@/wrappers/cell-api-wrapper";
import { useNotebookApi } from "@/wrappers/UseNotebookApiWrapper";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import LoadingSpinner from "@/components/loader-mock";
import { Box, Container, Typography, IconButton, Grid } from "@mui/material";
import ModalErrorAlert from "@/components/modal-error-alert";
import { Notebook } from "@/api/notebook-api";
import { useNotebookExtApi } from "@/wrappers/notebook-ext-api-wrapper";
import { Cell as UICell } from "@/utils/cell-ui";
import { Cell as RawCell } from "@/api/cell-api";
import { useCellTypes } from "@/wrappers/cell-types-wrapper";
import { converterCellsWithoutHooks } from "@/utils/cell-converter";
import NotebookEditor from "@/components/notebook-editor";
import NotebookViewer from "@/components/notebook-viewer";
import AppBar, { MainLabel, StandartToolBar } from "@/components/app-bar";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useUser } from "@/hooks/use-user";
import ErrorModal from "@/components/modal-error-alert";

export default function NotebookPage() {
    const params = useParams();
    const router = useRouter();
    const notebookId = params!.id as string;
    const notebookApi = useNotebookExtApi();
    const cellApi = useCellApi();
    const { user, isLoading: userLoading, error: userError } = useUser();

    const [notebook, setNotebook] = useState<Notebook | null>(null);
    const cellTypes = useCellTypes();
    const [uiCells, setUICells] = useState<UICell[]>([]);
    const rawCellsRef = useRef<RawCell[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Проверка прав на редактирование (пока всегда true)
    const canEdit = useCallback(() => notebook?.author === user?.nickname , []);

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

                setUICells((prev) =>
                    prev.map((c) =>
                        c.id === cellId ? { ...c, state: newContent } : c
                    )
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
                rawCellsRef.current = cellsData;
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

    // Обработчики для NotebookEditor
    const handleTitleChange = async (newTitle: string) => {
        if (!notebook) return;

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
            rawCellsRef.current = [...rawCellsRef.current, newRawCell];
            setUICells((prev) => {
                const newCells = [...prev];
                newCells.splice(index, 0, newCell);
                return newCells;
            });

            return newCell;
        } catch (err) {
            console.error("Failed to add cell:", err);
            setError("Не удалось добавить ячейку");
        }
    };

    const handleDeleteCell = async (cellId: string) => {
        try {
            await cellApi.delete(notebookId, cellId);
            rawCellsRef.current = rawCellsRef.current.filter(
                (c) => c.id !== cellId
            );
            setUICells((prev) => prev.filter((cell) => cell.id !== cellId));
        } catch (err) {
            console.error("Failed to delete cell:", err);
            setError("Не удалось удалить ячейку");
        }
    };

    const toggleEditMode = () => setIsEditMode(!isEditMode);

    if (userError) {
        return <ErrorModal error={userError} onClose={() => {}} />;
    }

    if (userLoading || loading) {
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
        <>
            <AppBar
                content={() => (
                    <StandartToolBar
                        title={() => (
                            <MainLabel
                                title={() => (
                                    <Typography variant="h6">
                                        {notebook.title}
                                    </Typography>
                                )}
                                onClick={() => router.push("/")}
                            />
                        )}
                        tools={() => (
                            <Box sx={{ display: "flex", gap: 1 }}>
                                {canEdit() && (
                                    <>
                                        <IconButton
                                            color="inherit"
                                            onClick={toggleEditMode}
                                            title={
                                                isEditMode
                                                    ? "Режим просмотра"
                                                    : "Режим редактирования"
                                            }
                                        >
                                            {isEditMode ? (
                                                <VisibilityIcon />
                                            ) : (
                                                <EditIcon />
                                            )}
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={() => {}}
                                            title="Настройки документа"
                                        >
                                            <SettingsIcon />
                                        </IconButton>
                                    </>
                                )}
                                <IconButton
                                    color="inherit"
                                    onClick={() => router.push("/profile")}
                                    title="Профиль"
                                >
                                    <AccountCircleIcon />
                                </IconButton>
                            </Box>
                        )}
                    />
                )}
            />

            <Grid
                container
                sx={{ width: "100%" }}
                justifyContent={"center"}
                alignItems={"center"}
            >
                <Grid size={{ xs: 11, sm: 8, md: 6, lg: 5 }}>
                    <Box sx={{ mt: 8 }}>
                        {isEditMode ? (
                            <NotebookEditor
                                title={notebook.title}
                                setTitle={handleTitleChange}
                                cells={uiCells}
                                addCell={handleAddCell}
                                deleteCell={handleDeleteCell}
                                updateCell={handleUpdateCell}
                            />
                        ) : (
                            <NotebookViewer
                                title={notebook.title}
                                cells={uiCells}
                            />
                        )}
                    </Box>
                </Grid>
            </Grid>
        </>
    );
}
