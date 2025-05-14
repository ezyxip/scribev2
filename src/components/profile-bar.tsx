"use client";
import { Box, Icon, IconButton, Typography, useTheme } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import React from "react";
import { useRouter } from "next/navigation";
import AppBar, { MainLabel, StandartToolBar } from "./app-bar";
import { useUserApi } from "@/wrappers/UserApiWrapper";
import { ArrowBack } from "@mui/icons-material";

type ProfileAppBarProps = {
    nickname: string;
};

export function ProfileAppBar(props: ProfileAppBarProps) {
    const router = useRouter();
    const theme = useTheme();
    const userApi = useUserApi();

    const handleLogout = () => {
        (async () => {
            await userApi.logout();
            router.push("/");
        })();
    };

    return (
        <AppBar
            content={() => (
                <StandartToolBar
                    title={() => (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={() => router.push("/")}
                                sx={{ mr: 2 }}
                            >
                                <ArrowBack />
                            </IconButton>
                            {/* Иконка профиля слева */}
                            <Icon>
                                <AccountCircleIcon
                                    sx={{
                                        color: theme.palette.primary
                                            .contrastText,
                                    }}
                                />
                            </Icon>

                            {/* Заголовок */}
                            <Typography variant="h6">
                                {props.nickname}
                            </Typography>
                        </Box>
                    )}
                    tools={() => (
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleLogout}
                        >
                            <ExitToAppIcon
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
