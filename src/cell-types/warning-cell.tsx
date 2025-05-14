import { Cell, CellProps } from "@/utils/cell-ui";
import {
    TextField,
    Typography,
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
} from "@mui/material";
import {
    Check as CheckIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

// Типы выделений
type HighlightType = "success" | "warning" | "error";

// Расширенный тип состояния ячейки
interface HighlightedCellState {
    text: string;
    type: HighlightType;
}

// Создаем кастомный тип CellProps с нашим состоянием
interface HighlightedCellProps
    extends Omit<CellProps, "state" | "changeState"> {
    state: HighlightedCellState;
    changeState: (newState: HighlightedCellState) => void;
}

const HighlightedTextEditor = (props: HighlightedCellProps) => {
    return !props.focus ? (
        <HighlightedTextPreviewer {...props} />
    ) : (
        <TextField
            value={props.state.text}
            onChange={(e) =>
                props.changeState({ ...props.state, text: e.target.value })
            }
            multiline
            fullWidth
        />
    );
};

const HighlightedTextPreviewer = (props: HighlightedCellProps) => {
    const theme = useTheme();
    const { type, text } = props.state;

    const styles: Record<
        HighlightType,
        {
            bg: string;
            color: string;
            icon: React.ReactNode;
        }
    > = {
        success: {
            bg: theme.palette.success.light,
            color: theme.palette.success.contrastText,
            icon: <CheckIcon fontSize="small" />,
        },
        warning: {
            bg: theme.palette.warning.light,
            color: theme.palette.warning.contrastText,
            icon: <WarningIcon fontSize="small" />,
        },
        error: {
            bg: theme.palette.error.light,
            color: theme.palette.error.contrastText,
            icon: <ErrorIcon fontSize="small" />,
        },
    };

    const currentStyle = styles[type];

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                backgroundColor: currentStyle.bg,
                color: currentStyle.color,
                padding: "8px 12px",
                borderRadius: 1,
                width: "100%",
            }}
        >
            {currentStyle.icon}
            <Typography variant="body2" whiteSpace="pre-line">
                {text}
            </Typography>
        </Box>
    );
};

const TopPanelFilling = ({
    state,
    changeState,
}: {
    state: HighlightedCellState;
    changeState: (newState: HighlightedCellState) => void;
}) => {
    const handleTypeChange = (
        _: React.MouseEvent<HTMLElement>,
        newType: HighlightType | null
    ) => {
        if (newType) {
            changeState({ ...state, type: newType });
        }
    };

    return (
        <ToggleButtonGroup
            value={state.type}
            exclusive
            onChange={handleTypeChange}
            size="small"
        >
            <Tooltip title="Success" arrow>
                <ToggleButton value="success">
                    <CheckIcon fontSize="small" />
                </ToggleButton>
            </Tooltip>
            <Tooltip title="Warning" arrow>
                <ToggleButton value="warning">
                    <WarningIcon fontSize="small" />
                </ToggleButton>
            </Tooltip>
            <Tooltip title="Error" arrow>
                <ToggleButton value="error">
                    <ErrorIcon fontSize="small" />
                </ToggleButton>
            </Tooltip>
        </ToggleButtonGroup>
    );
};

export const HighlightedTextCell: Cell = {
    id: "highlighted-text",
    RenderInEditor: HighlightedTextEditor,
    RenderInViewer: HighlightedTextPreviewer,
    TopPanelFilling: TopPanelFilling,
    state: {
        text: "",
        type: "warning", // значение по умолчанию
    },
};
