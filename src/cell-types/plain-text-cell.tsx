import { Cell, CellProps } from "@/utils/cell-ui";
import { TextField, Typography } from "@mui/material";

const PlainTextEditor = (props: CellProps) => {
    let comp;
    if(!props.focus){
        comp = <PlainTextPreviewer {...props}/>
    }else{
        comp = <TextField
            value={props.state}
            onChange={(e) => props.changeState(e.target.value)}
            multiline
            fullWidth
        />
    }
    return (
        <>
            {comp}
        </>
    )
}

const PlainTextPreviewer = (props: CellProps) => {
    return (
        <Typography>{props.state}</Typography>
    )
}

export const PlainTextCell: Cell = {
    id: "plain-text",
    RenderInEditor: PlainTextEditor,
    RenderInViewer: PlainTextPreviewer,
    TopPanelFilling: () => <></>,
    state: "PlainText"
}