"use client";

import { Cell } from "@/utils/cell-ui";
import { Container, Box, Typography, Paper } from "@mui/material";

export type ViewerProps = {
    title: string;
    cells: Cell[];
};

export default function NotebookViewer(props: ViewerProps) {
    return (
        <Container maxWidth="md">
            <Box sx={{ height: "3em" }} />
            <Typography 
                variant="h4" 
                sx={{ 
                    marginBottom: 3, 
                    fontWeight: 'bold',
                    wordBreak: 'break-word'
                }}
            >
                {props.title}
            </Typography>
            
            {props.cells.map((cell) => (
                <Paper
                    key={cell.id}
                    sx={{
                        marginTop: 2,
                        padding: 2,
                        backgroundColor: 'background.paper',
                        border: 'none',
                        overflow: 'visible' // Если нужны выпадающие элементы
                    }}
                    elevation={0} // Убираем тень для более плоского дизайна
                >
                    <cell.RenderInViewer
                        state={cell.state}
                        focus={false}
                        changeState={() => {}}
                    />
                </Paper>
            ))}
            
            <Box sx={{ height: "50vh" }} />
        </Container>
    );
}