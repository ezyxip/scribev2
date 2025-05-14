"use client";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import {
    Grid,
    Box,
    Tabs,
    Tab,
    Toolbar,
    Button,
    useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import { useNotebooks } from "@/hooks/use-notebooks";
import { useSort } from "@/hooks/use-sort";
import LoadingSpinner from "@/components/loader-mock";
import ErrorModal from "@/components/modal-error-alert";
import { ProfileAppBar } from "@/components/profile-bar";
import { SortControls } from "@/components/sort-controls";
import { Add } from "@mui/icons-material";
import { NotebooksList } from "@/components/notebook-list";

export type SortOption = "createdAt" | "lastActiveAt" | "title";
export type SortOrder = "asc" | "desc";

export default function ProfilePage() {
    const { isLoading, user, error } = useUser();
    const router = useRouter();
    const [tabValue, setTabValue] = useState(0);
    const [page, setPage] = useState(0);
    const {
        notebooks,
        addNotebook,
        deleteNotebook,
        isLoading: notebookLoading,
        error: notebookError,
    } = useNotebooks(page, 10);
    const sort = useSort();
    const isMobile = useMediaQuery((theme: any) =>
        theme.breakpoints.down("sm")
    );

    const handleNotebookClick = (id: string) => {
        router.push(`/note-edit/${id}`);
    };

    if (isLoading || notebookLoading) return <LoadingSpinner />;
    if (error || notebookError)
        return <ErrorModal error={error} onClose={router.back} />;

    return (
        <>
            <ProfileAppBar nickname={user!.nickname} />
            <Grid
                container
                justifyContent="center"
                sx={{ width: "100%", mt: 2 }}
            >
                <Grid size={{ xs: 12, sm: 10, md: 8, lg: 6 }}>
                    <Box sx={{ p: { xs: 1, sm: 3 } }}>
                        <Tabs
                            value={tabValue}
                            onChange={(_, v) => setTabValue(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                        >
                            <Tab label="Материалы" />
                            <Tab label="Проекты" disabled />
                        </Tabs>

                        {tabValue === 0 && (
                            <>
                                <Toolbar
                                    disableGutters
                                    sx={{
                                        justifyContent: "space-between",
                                        mb: 3,
                                        gap: 2,
                                        flexDirection: {
                                            xs: "column",
                                            sm: "row",
                                        },
                                        alignItems: {
                                            xs: "stretch",
                                            sm: "center",
                                        },
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={addNotebook}
                                        fullWidth={isMobile}
                                        size={isMobile ? "large" : "medium"}
                                    >
                                        Добавить ноутбук
                                    </Button>
                                    <SortControls
                                        {...sort}
                                        isMobile={isMobile}
                                    />
                                </Toolbar>
                                <NotebooksList
                                    notebooks={notebooks.filter(
                                        (e) => e.author === user?.nickname
                                    )}
                                    onDelete={deleteNotebook}
                                    onClick={handleNotebookClick}
                                />
                            </>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </>
    );
}
