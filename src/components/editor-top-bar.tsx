import { CellProps } from "@/utils/cell-ui";
import { ToggleableTopBar } from "./toggleable-top-bar";
import { Box, Button, IconButton } from "@mui/material";
import { Close, Delete } from "@mui/icons-material";

type EditorTopBarProps = {
    isVisible: boolean;
    items: React.ComponentType;
    onClose: () => void;
    onDelete: () => void;
};

export default function EditorTopBar(props: EditorTopBarProps) {
    return (
        <ToggleableTopBar isVisible={props.isVisible}>
            <Box sx={{ display: "flex", alignItems: "center"}}>
                <IconButton onClick={props.onClose}>
                    <Close/>
                </IconButton>
                <IconButton onClick={props.onDelete}>
                    <Delete/>
                </IconButton>
                <Box sx={{width: "2em"}}/>
                <props.items/>
            </Box>
        </ToggleableTopBar>
    );
}
