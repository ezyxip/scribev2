import { AppBar, Box, Toolbar } from "@mui/material";
import { ReactNode } from "react";

interface TopBarProps {
    children: ReactNode;
    isVisible: boolean;
}

export const ToggleableTopBar = ({ children, isVisible }: TopBarProps) => {
    if (!isVisible) return null; // Просто не рендерим, если не видно

    return (
        <AppBar
            position="fixed"
            elevation={4}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: "background.paper",
                color: "text.primary",
                overflowX: "auto",
                "& .MuiToolbar-root": {
                    minWidth: "max-content",
                    padding: 0,
                },
            }}
        >
            <Toolbar>
                <Box
                    width="100%"
                    display="flex"
                    alignItems="center"
                    sx={{ minWidth: "max-content" }}
                >
                    {children}
                </Box>
            </Toolbar>
        </AppBar>
    );
};
