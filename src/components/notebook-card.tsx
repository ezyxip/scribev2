"use client";

import {
    Card,
    CardContent,
    CardActions,
    Typography,
    IconButton,
    Stack,
    styled,
} from "@mui/material";
import { Delete, Star } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Notebook } from "@/api/notebook-api";

const StyledCard = styled(Card)(({ theme }) => ({
    minWidth: 275,
    marginBottom: theme.spacing(2),
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: theme.shadows[8],
    },
}));

const DeleteButton = styled(IconButton)({
    marginLeft: "auto",
    "&:hover": {
        backgroundColor: "rgba(255, 0, 0, 0.1)",
    },
});

export const NotebookCard = ({
    notebook,
    onDelete,
}: {
    notebook: Notebook;
    onDelete: (id: string) => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <StyledCard>
                <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        {notebook.title}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom sx={{ fontStyle: "italic" }}>
                        @{notebook.author}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5, color: "text.primary" }}>
                        {notebook.description}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Star fontSize="small" color="warning" />
                        <Typography sx={{ fontWeight: 500 }}>{notebook.views}</Typography>
                    </Stack>
                </CardContent>
                <CardActions>
                    <DeleteButton
                        size="small"
                        onClick={() => onDelete(notebook.id)}
                        color="error"
                    >
                        <Delete />
                    </DeleteButton>
                </CardActions>
            </StyledCard>
        </motion.div>
    );
};