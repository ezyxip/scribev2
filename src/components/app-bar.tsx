"use client";
import {
    Box,
    Grid,
    IconButton,
    AppBar as MUIAppBar,
    Toolbar,
    Typography,
    useTheme,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import React, { ComponentType, JSX, ReactNode } from "react";
import { useRouter } from "next/navigation";

type AppBarProps = {
    content: ComponentType;
};

export default function AppBar(props: AppBarProps) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <MUIAppBar position="static">
                <Toolbar>
                    <props.content />
                </Toolbar>
            </MUIAppBar>
        </Box>
    );
}

type StandartToolBarProps = {
    title: ComponentType;
    tools: ComponentType;
};

export const StandartToolBar = (props: StandartToolBarProps) => {
    return (
        <Grid
            container
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            sx={{ width: "100%" }}
        >
            <props.title />
            <props.tools />
        </Grid>
    );
};

type MainLabelProps = {
    title: ComponentType;
    onClick: ()=>void;
};
export const MainLabel = (props: MainLabelProps) => {
    return (
        <Box onClick={props.onClick} sx={{ cursor: "pointer" }}>
            <props.title />
        </Box>
    );
};

export function AppBarPreview() {
    const nav = useRouter();
    const theme = useTheme();
    return (
        <AppBar
            content={() => (
                <StandartToolBar
                    title={() => (
                        <MainLabel
                            title={() => (
                                <Typography variant="h5">Scribe!</Typography>
                            )}
                            onClick={() => nav.push("/")}
                        />
                    )}
                    tools={() => (
                        <IconButton>
                            <AccountCircleIcon
                                sx={{
                                    color: theme.palette.primary.contrastText,
                                }}
                            />
                        </IconButton>
                    )}
                />
            )}
        />
    );
}
