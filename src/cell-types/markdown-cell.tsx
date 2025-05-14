import { Cell, CellProps } from "@/utils/cell-ui";
import { TextField } from "@mui/material";
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

const MarkdownPreviewer = (props: CellProps) => {
  return (
    <ReactMarkdown>
      {props.state || ""}
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