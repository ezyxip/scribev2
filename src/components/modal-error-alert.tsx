import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Button,
    Box,
    Typography,
    DialogActions,
} from "@mui/material";

// Определяем типы пропсов
interface ErrorModalProps {
    error: Error | null;
    onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose }) => {
    if (!error) return null;


    return (
        <Dialog open={true} onClose={onClose}>
            <DialogTitle>
                <Typography color="error">Ошибка</Typography>
            </DialogTitle>
            <DialogContent>
                <DialogContentText color="error">
                    <strong>{error.name}</strong>: {error.message}
                </DialogContentText>
                {error.stack && (
                    <Box
                        component="pre"
                        sx={{
                            mt: 2,
                            bgcolor: "background.default",
                            p: 2,
                            borderRadius: 1,
                            fontSize: "0.875rem",
                            maxHeight: "300px",
                            overflowY: "auto",
                            whiteSpace: "pre-wrap",
                            border: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        {error.stack}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" variant="contained">
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ErrorModal;
