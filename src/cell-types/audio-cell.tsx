import { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    IconButton,
    Typography,
    Stack,
    Slider,
    CircularProgress,
} from "@mui/material";
import {
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    Delete as DeleteIcon,
    MusicNote as MusicIcon,
    Upload as UploadIcon,
} from "@mui/icons-material";
import { Cell, CellProps } from "@/utils/cell-ui";
import { supabase } from "@/utils/supabase-client";

// Типы для аудиозаписи
interface AudioTrack {
    url: string;
    name: string;
    duration?: number;
}

// Состояние ячейки
interface AudioCellState {
    tracks: AudioTrack[];
    isLoading: boolean;
    currentTrackIndex?: number;
    isPlaying: boolean;
    progress: number;
}

const AudioCellEditor = (props: CellProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [localState, setLocalState] = useState({
        isPlaying: false,
        progress: 0,
    });

    // Синхронизация состояния аудио
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setLocalState((prev) => ({
                ...prev,
                progress: (audio.currentTime / audio.duration) * 100 || 0,
            }));
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("ended", handleAudioEnd);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("ended", handleAudioEnd);
        };
    }, []);

    const handleAudioUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        props.changeState({ ...props.state, isLoading: true });

        try {
            const newTracks = await Promise.all(
                files.map(async (file): Promise<AudioTrack> => {
                    // Проверка типа файла
                    if (!file.type.startsWith("audio/")) {
                        throw new Error("Неверный формат файла");
                    }

                    const fileExt = file.name.split(".").pop();
                    const fileName = `audio_${Date.now()}.${fileExt}`;

                    const { error } = await supabase.storage
                        .from("audio")
                        .upload(fileName, file);

                    if (error) throw error;

                    const {
                        data: { publicUrl },
                    } = supabase.storage.from("audio").getPublicUrl(fileName);

                    // Получаем длительность аудио
                    const duration = await getAudioDuration(file);

                    return {
                        url: publicUrl,
                        name: file.name,
                        duration,
                    };
                })
            );

            props.changeState({
                ...props.state,
                tracks: [...props.state.tracks, ...newTracks],
                isLoading: false,
            });
        } catch (error) {
            console.error("Upload error:", error);
            props.changeState({ ...props.state, isLoading: false });
        }
    };

    const getAudioDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.src = URL.createObjectURL(file);
            audio.onloadedmetadata = () => {
                resolve(audio.duration);
                URL.revokeObjectURL(audio.src);
            };
        });
    };

    const handleDeleteTrack = async (index: number) => {
        const trackToDelete = props.state.tracks[index];
        const fileName = trackToDelete.url.split("/").pop();

        try {
            props.changeState({ ...props.state, isLoading: true });

            await supabase.storage.from("audio").remove([fileName || ""]);

            const updatedTracks = [...props.state.tracks];
            updatedTracks.splice(index, 1);

            props.changeState({
                ...props.state,
                tracks: updatedTracks,
                currentTrackIndex: undefined,
                isPlaying: false,
                isLoading: false,
            });
        } catch (error) {
            console.error("Delete error:", error);
            props.changeState({ ...props.state, isLoading: false });
        }
    };

    const togglePlay = (index: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        const isSameTrack = props.state.currentTrackIndex === index;

        if (isSameTrack && props.state.isPlaying) {
            audio.pause();
            props.changeState({ ...props.state, isPlaying: false });
        } else {
            audio.src = props.state.tracks[index].url;
            audio.currentTime =
                (props.state.progress / 100) * audio.duration || 0;
            audio.play();
            props.changeState({
                ...props.state,
                currentTrackIndex: index,
                isPlaying: true,
            });
        }
    };

    const handleAudioEnd = () => {
        props.changeState({ ...props.state, isPlaying: false, progress: 0 });
    };

    const handleProgressChange = (_: Event, value: number | number[]) => {
        const progress = Array.isArray(value) ? value[0] : value;
        props.changeState({ ...props.state, progress });

        const audio = audioRef.current;
        if (audio && props.state.currentTrackIndex !== undefined) {
            audio.currentTime = (progress / 100) * audio.duration;
        }
    };

    const formatTime = (seconds?: number) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <Box sx={{ width: "100%" }}>
            {/* Скрытый audio элемент для управления воспроизведением */}
            <audio ref={audioRef} />

            {props.state.isLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                </Box>
            ) : props.state.tracks.length > 0 ? (
                <Stack spacing={2}>
                    {props.state.tracks.map((track: {url: string, name: string, duration?: number}, index: number) => (
                        <Box
                            key={track.url}
                            sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                            >
                                <IconButton
                                    onClick={() => togglePlay(index)}
                                    color="primary"
                                    size="small"
                                >
                                    {props.state.currentTrackIndex === index &&
                                    props.state.isPlaying ? (
                                        <PauseIcon />
                                    ) : (
                                        <PlayIcon />
                                    )}
                                </IconButton>

                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography noWrap sx={{ fontWeight: 500 }}>
                                        {track.name}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="textSecondary"
                                    >
                                        {formatTime(track.duration)}
                                    </Typography>
                                </Box>

                                <IconButton
                                    onClick={() => handleDeleteTrack(index)}
                                    color="error"
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Stack>

                            {props.state.currentTrackIndex === index && (
                                <Box sx={{ mt: 1 }}>
                                    <Slider
                                        value={props.state.progress}
                                        onChange={handleProgressChange}
                                        size="small"
                                    />
                                </Box>
                            )}
                        </Box>
                    ))}
                </Stack>
            ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                    Аудиозаписи не добавлены
                </Typography>
            )}

            <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ mt: 2 }}
            >
                Загрузить аудио
                <input
                    type="file"
                    hidden
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    multiple
                />
            </Button>
        </Box>
    );
};

const AudioCellViewer = (props: CellProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [localState, setLocalState] = useState({
        isPlaying: false,
        progress: 0,
        currentTrackIndex: undefined as number | undefined,
    });

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setLocalState((prev) => ({
                ...prev,
                progress: (audio.currentTime / audio.duration) * 100 || 0,
            }));
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("ended", handleAudioEnd);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("ended", handleAudioEnd);
        };
    }, []);

    const togglePlay = (index: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        const isSameTrack = localState.currentTrackIndex === index;

        if (isSameTrack && localState.isPlaying) {
            audio.pause();
            setLocalState((prev) => ({ ...prev, isPlaying: false }));
        } else {
            audio.src = props.state.tracks[index].url;
            audio.currentTime =
                (localState.progress / 100) * audio.duration || 0;
            audio.play();
            setLocalState({
                currentTrackIndex: index,
                isPlaying: true,
                progress: localState.progress,
            });
        }
    };

    const handleAudioEnd = () => {
        setLocalState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
    };

    const formatTime = (seconds?: number) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <Box sx={{ width: "100%" }}>
            <audio ref={audioRef} />

            {props.state.tracks.length > 0 ? (
                <Stack spacing={1}>
                    {props.state.tracks.map((track: {url: string, name: string, duration?: number}, index: number) => (
                        <Box
                            key={track.url}
                            sx={{
                                p: 1.5,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                            >
                                <IconButton
                                    onClick={() => togglePlay(index)}
                                    color="primary"
                                    size="small"
                                >
                                    {localState.currentTrackIndex === index &&
                                    localState.isPlaying ? (
                                        <PauseIcon fontSize="small" />
                                    ) : (
                                        <PlayIcon fontSize="small" />
                                    )}
                                </IconButton>

                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography noWrap variant="body2">
                                        {track.name}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="textSecondary"
                                    >
                                        {formatTime(track.duration)}
                                    </Typography>
                                </Box>
                            </Stack>

                            {localState.currentTrackIndex === index && (
                                <Box sx={{ mt: 1 }}>
                                    <Slider
                                        value={localState.progress}
                                        size="small"
                                        sx={{
                                            cursor: "default",
                                            pointerEvents: "none",
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    ))}
                </Stack>
            ) : (
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ p: 1 }}
                >
                    <MusicIcon color="disabled" fontSize="small" />
                    <Typography variant="body2" color="textSecondary">
                        Аудио не добавлено
                    </Typography>
                </Stack>
            )}
        </Box>
    );
};

export const AudioCell: Cell = {
    id: "audio-cell",
    RenderInEditor: AudioCellEditor,
    RenderInViewer: AudioCellViewer,
    TopPanelFilling: () => null,
    state: {
        tracks: [],
        isLoading: false,
        isPlaying: false,
        progress: 0,
    },
};
