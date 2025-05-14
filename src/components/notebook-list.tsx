import { NotebookCard } from "./notebook-card";
import { Notebook } from "@/api/notebook-api";
import { Box, Typography } from "@mui/material";

type Props = {
    notebooks: Notebook[];
    onDelete: (id: string) => void;
    onClick: (id: string) => void;
};

export const NotebooksList = ({ notebooks, onDelete, onClick }: Props) => {
    if (notebooks.length === 0) {
        return (
            <Typography textAlign="center" sx={{ py: 4 }}>
                У вас пока нет ноутбуков
            </Typography>
        );
    }

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr" },
                gap: 2,
            }}
        >
            {notebooks.map((notebook) => (
                <NotebookCard onClick = {() => onClick(notebook.id)} key={notebook.id} notebook={notebook} onDelete={onDelete} />
            ))}
        </Box>
    );
};
