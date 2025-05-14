import { Cell, CellProps } from "@/utils/cell-ui";
import { TextField, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";

const MarkdownEditor = (props: CellProps) => {
    return props.focus ? (
        <TextField
            value={props.state}
            onChange={(e) => props.changeState(e.target.value)}
            multiline
            fullWidth
            minRows={5}
        />
    ) : (
        <MarkdownPreviewer {...props} />
    );
};

const MarkdownPreviewer = ({ state }: CellProps) => {
    return (
            <ReactMarkdown
                components={{
                    h1: ({ node, ...props }) => (
                        <Typography variant="h1" gutterBottom {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <Typography variant="h2" gutterBottom {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <Typography variant="h3" gutterBottom {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                        <Typography variant="h4" gutterBottom {...props} />
                    ),
                    h5: ({ node, ...props }) => (
                        <Typography variant="h5" gutterBottom {...props} />
                    ),
                    h6: ({ node, ...props }) => (
                        <Typography variant="h6" gutterBottom {...props} />
                    ),
                    p: ({ node, ...props }) => (
                        <Typography variant="body1" paragraph {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <Typography component="li" variant="body1" {...props} />
                    ),
                    // Добавьте другие компоненты по необходимости
                }}
            >
                {state || ""}
            </ReactMarkdown>
    );
};

export const MarkdownCell: Cell = {
    id: "markdown",
    RenderInEditor: MarkdownEditor,
    RenderInViewer: MarkdownPreviewer,
    TopPanelFilling: () => <></>,
    state: "**Markdown** content",
};
