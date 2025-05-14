import { useState } from "react";
import {
    Box,
    Button,
    IconButton,
    Typography,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    CircularProgress,
    Dialog,
    DialogContent,
} from "@mui/material";
import {
    AddPhotoAlternate as AddIcon,
    Delete as DeleteIcon,
    ZoomIn as ZoomIcon,
} from "@mui/icons-material";
import { Cell, CellProps } from "@/utils/cell-ui";
import { supabase } from "@/utils/supabase-client";

interface ImageGalleryCellState {
    images: Array<{
        url: string;
        name: string;
    }>;
    isLoading: boolean;
}

const ImageGalleryCellEditor = (props: CellProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        props.changeState({ ...props.state, isLoading: true });

        try {
            const uploadedImages = await Promise.all(
                files.map(async (file) => {
                    const fileExt = file.name.split(".").pop();
                    const fileName = `${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 9)}.${fileExt}`;

                    const { error } = await supabase.storage
                        .from("images")
                        .upload(fileName, file);

                    if (error) throw error;

                    const {
                        data: { publicUrl },
                    } = supabase.storage.from("images").getPublicUrl(fileName);

                    return {
                        url: publicUrl,
                        name: file.name,
                    };
                })
            );

            props.changeState({
                images: [...props.state.images, ...uploadedImages],
                isLoading: false,
            });
        } catch (error) {
            console.error("Upload error:", error);
            props.changeState({ ...props.state, isLoading: false });
        }
    };

    const handleDeleteImage = async (index: number) => {
        const imageToDelete = props.state.images[index];
        const fileName = imageToDelete.url.split("/").pop();

        try {
            props.changeState({ ...props.state, isLoading: true });

            await supabase.storage.from("images").remove([fileName || ""]);

            const updatedImages = [...props.state.images];
            updatedImages.splice(index, 1);

            props.changeState({
                images: updatedImages,
                isLoading: false,
            });
        } catch (error) {
            console.error("Delete error:", error);
            props.changeState({ ...props.state, isLoading: false });
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            {props.state.isLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <ImageList
                        cols={3}
                        rowHeight={120}
                        sx={{
                            m: 0,
                            mb: 2,
                            overflow: "hidden",
                            maxHeight: 400,
                        }}
                    >
                        {props.state.images.map(
                            (
                                img: {
                                    url: string;
                                    name: string;
                                },
                                index: number
                            ) => (
                                <ImageListItem key={img.url}>
                                    <img
                                        src={img.url}
                                        alt={img.name}
                                        loading="lazy"
                                        style={{
                                            height: "100%",
                                            objectFit: "cover",
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            setSelectedImage(img.url)
                                        }
                                    />
                                    <ImageListItemBar
                                        position="top"
                                        actionIcon={
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteImage(index);
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        }
                                        actionPosition="right"
                                        sx={{
                                            background:
                                                "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
                                        }}
                                    />
                                </ImageListItem>
                            )
                        )}
                    </ImageList>

                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        fullWidth
                    >
                        Добавить изображения
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </Button>
                </>
            )}

            <Dialog
                open={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                maxWidth="md"
            >
                <DialogContent>
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Просмотр"
                            style={{
                                width: "100%",
                                height: "auto",
                                maxHeight: "80vh",
                                objectFit: "contain",
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

const ImageGalleryCellViewer = (props: CellProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!props.state.images.length) {
        return (
            <Typography color="textSecondary" variant="body2">
                Изображения не загружены
            </Typography>
        );
    }

    return (
        <Box sx={{ width: "100%" }}>
            <ImageList cols={3} gap={8} sx={{ m: 0 }}>
                {props.state.images.map(
                    (img: { url: string; name: string }) => (
                        <ImageListItem key={img.url}>
                            <img
                                src={img.url}
                                alt={img.name}
                                loading="lazy"
                                style={{
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    aspectRatio: "1",
                                    objectFit: "cover",
                                }}
                                onClick={() => setSelectedImage(img.url)}
                            />
                            <ImageListItemBar
                                position="bottom"
                                title={img.name}
                                subtitle={
                                    img.url
                                        .replace(/^https?:\/\//, "")
                                        .substring(0, 20) + "..."
                                }
                                sx={{
                                    "& .MuiImageListItemBar-title": {
                                        fontSize: "0.75rem",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    },
                                    "& .MuiImageListItemBar-subtitle": {
                                        fontSize: "0.65rem",
                                    },
                                }}
                            />
                        </ImageListItem>
                    )
                )}
            </ImageList>

            <Dialog
                open={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                maxWidth="md"
            >
                <DialogContent>
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Просмотр"
                            style={{
                                width: "100%",
                                height: "auto",
                                maxHeight: "80vh",
                                objectFit: "contain",
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export const ImageGalleryCell: Cell = {
    id: "image-gallery",
    RenderInEditor: ImageGalleryCellEditor,
    RenderInViewer: ImageGalleryCellViewer,
    TopPanelFilling: () => null,
    state: {
        images: [],
        isLoading: false,
    },
};
