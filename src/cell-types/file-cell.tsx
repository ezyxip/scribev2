import { Cell, CellProps } from "@/utils/cell-ui";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Typography,
    Paper,
    Stack,
    Avatar,
} from "@mui/material";
import {
    Upload as UploadIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import { supabase } from "@/utils/supabase-client";

interface FileCellState {
    url: string | null;
    name: string;
    isLoading: boolean;
}

const FileCellEditor = (props: CellProps) => {
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        props.changeState({ ...props.state, isLoading: true });

        try {
            // Генерируем уникальное имя файла
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Загружаем файл в Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("files") // Ваш бакет в Supabase
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Получаем публичный URL
            const {
                data: { publicUrl },
            } = supabase.storage.from("files").getPublicUrl(filePath);

            props.changeState({
                url: publicUrl,
                name: file.name,
                isLoading: false,
            });
        } catch (error) {
            console.error("Upload error:", error);
            props.changeState({ ...props.state, isLoading: false });
        }
    };

    const handleDelete = async () => {
        if (!props.state.url) return;

        try {
            props.changeState({ ...props.state, isLoading: true });

            // Извлекаем путь к файлу из URL
            const filePath = props.state.url.split("/").pop();

            // Удаляем файл из Supabase Storage
            const { error } = await supabase.storage
                .from("files")
                .remove([filePath]);

            if (error) throw error;

            props.changeState({
                url: null,
                name: "",
                isLoading: false,
            });
        } catch (error) {
            console.error("Delete error:", error);
            props.changeState({ ...props.state, isLoading: false });
        }
    };

    return (
        <Box sx={{ width: "100%", overflow: "hidden" }}>
            {props.state.isLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                </Box>
            ) : props.state.url ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "100%",
                        boxSizing: "border-box",
                    }}
                >
                    <Avatar
                        sx={{
                            flexShrink: 0,
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                            width: 36,
                            height: 36,
                        }}
                    >
                        <UploadIcon fontSize="small" />
                    </Avatar>

                    <Box
                        sx={{
                            flexGrow: 1,
                            minWidth: 0, // Это важно для корректного обрезания текста
                            overflow: "hidden",
                        }}
                    >
                        <Typography noWrap sx={{ fontWeight: 500 }}>
                            {props.state.name}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="textSecondary"
                            noWrap
                            sx={{
                                display: "block",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                            }}
                        >
                            {props.state.url.replace(/^https?:\/\//, "")}
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={handleDelete}
                        color="error"
                        size="small"
                        sx={{ flexShrink: 0 }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Paper>
            ) : (
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    fullWidth
                >
                    Загрузить файл
                    <input type="file" hidden onChange={handleFileUpload} />
                </Button>
            )}
        </Box>
    );
};

const FileCellViewer = (props: CellProps) => {
    if (!props.state.url) {
        return <Typography color="textSecondary">Файл не загружен</Typography>;
    }

    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Avatar>
                <UploadIcon />
            </Avatar>
            <Box>
                <Typography>{props.state.name}</Typography>
                <Button
                    variant="text"
                    size="small"
                    onClick={() => window.open(props.state.url!, "_blank")}
                >
                    Скачать
                </Button>
            </Box>
        </Stack>
    );
};

export const FileCell: Cell = {
    id: "file-cell",
    RenderInEditor: FileCellEditor,
    RenderInViewer: FileCellViewer,
    TopPanelFilling: () => null,
    state: {
        url: null,
        name: "",
        isLoading: false,
    },
};
