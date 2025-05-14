"use client";

import { useState, useEffect } from "react";
import { Notebook } from "@/api/notebook-api";
import ScribeBar from "@/components/scribe-bar";
import {
    Container,
    TextField,
    List,
    ListItem,
    ListItemText,
    Typography,
    CircularProgress,
    Box,
    Paper,
    Divider,
    Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNotebookExtApi } from "@/wrappers/notebook-ext-api-wrapper";
import { useRouter } from "next/navigation";
import PushPinIcon from "@mui/icons-material/PushPin";

export default function Home() {
    const notebookApi = useNotebookExtApi();
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [filteredNotebooks, setFilteredNotebooks] = useState<Notebook[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadNotebooks = async () => {
            try {
                const data = await notebookApi.get(100, 0);
                setNotebooks(data);
                setFilteredNotebooks(data);
            } catch (error) {
                console.error("Failed to load notebooks:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadNotebooks();
    }, [notebookApi]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            // Добавляем закреплённый ноутбук (ID=8) в начало списка
            const pinnedNotebook = notebooks.find((n) => Number(n.id) === 8);
            const otherNotebooks = notebooks.filter((n) => Number(n.id) !== 8);

            if (pinnedNotebook) {
                setFilteredNotebooks([pinnedNotebook, ...otherNotebooks]);
            } else {
                setFilteredNotebooks(notebooks);
            }
        } else {
            // Без закрепа — просто фильтруем по заголовку
            const filtered = notebooks.filter((notebook) =>
                notebook.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredNotebooks(filtered);
        }
    }, [searchQuery, notebooks]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("ru-RU");
    };

    return (
        <>
            <ScribeBar />

            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Сообщество
                </Typography>
                <Typography>
                    Исследуйте открытые материалы, чтобы найти для себя что-то
                    новое!
                </Typography>

                <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Поиск ноутбуков по названию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon
                                    sx={{ mr: 1, color: "action.active" }}
                                />
                            ),
                        }}
                    />
                </Paper>

                {isLoading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : filteredNotebooks.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        textAlign="center"
                        mt={4}
                    >
                        {searchQuery
                            ? "Ничего не найдено по вашему запросу"
                            : "Нет доступных ноутбуков"}
                    </Typography>
                ) : (
                    <Paper elevation={3}>
                        <List>
                            {filteredNotebooks.map((notebook, index) => (
                                <div key={notebook.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        onClick={() => {
                                            router.push(
                                                "/note-edit/" + notebook.id
                                            );
                                        }}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <ListItemText
                                            primary={
                                                <>
                                                    {Number(notebook.id) ===
                                                        8 && <PushPinIcon />}
                                                    <Typography
                                                        variant="h6"
                                                        component="div"
                                                    >
                                                        {notebook.title}
                                                    </Typography>
                                                </>
                                            }
                                            secondary={
                                                <>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                        display="block"
                                                    >
                                                        Автор: {notebook.author}
                                                    </Typography>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                        display="block"
                                                        sx={{
                                                            display: "flex",
                                                            gap: 1,
                                                            mt: 1,
                                                        }}
                                                    >
                                                        <Chip
                                                            label={`Просмотры: ${notebook.views}`}
                                                            size="small"
                                                            variant="outlined"
                                                            component="span"
                                                        />
                                                        <Chip
                                                            label={`Создан: ${formatDate(
                                                                notebook.createdAt
                                                            )}`}
                                                            size="small"
                                                            variant="outlined"
                                                            component="span"
                                                        />
                                                        <Chip
                                                            label={`Обновлён: ${formatDate(
                                                                notebook.lastActiveAt
                                                            )}`}
                                                            size="small"
                                                            variant="outlined"
                                                            component="span"
                                                        />
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < filteredNotebooks.length - 1 && (
                                        <Divider />
                                    )}
                                </div>
                            ))}
                        </List>
                    </Paper>
                )}
            </Container>
        </>
    );
}
