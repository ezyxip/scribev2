"use client";

import { IconButton, Typography, useTheme } from "@mui/material";
import { ComponentType } from "react";
import LoadingSpinner from "./loader-mock";
import { User } from "@/api/user-api";
import AppBar, { MainLabel, StandartToolBar } from "./app-bar";
import { theme } from "@/utils/mui-theme";
import { useRouter } from "next/navigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useUser } from "@/hooks/use-user";
import ErrorModal from "./modal-error-alert";

type ScribeBarProps = {
    title?: ComponentType;
};

const ScribeBar = ({
    title = ()=><Typography variant="h5">Scribe!</Typography>,
}: ScribeBarProps) => {

    const {user, isLoading, error} = useUser()
    
    if(error){
        return <ErrorModal error={error} onClose={()=>{}}/>
    }

    if (isLoading) return <LoadingSpinner />;
    else return <UserAppBar user={user} title = {title}/>;
};
export default ScribeBar;

const UserAppBar = (props: { user: User | null, title: ComponentType }) => {
    const nav = useRouter();
    if (props.user) {
        return <AuthUserAppBar nav={nav} title = {props.title}/>;
    } else {
        return <AnonymUserAppBar nav={nav} title = {props.title}/>;
    }
};

const AuthUserAppBar = (props: { nav: AppRouterInstance, title: ComponentType }) => {
    const router = useRouter()
    return (
        <AppBar
            content={() => (
                <StandartToolBar
                    title={() => (
                        <MainLabel
                            title={props.title}
                            onClick={ ()=>props.nav.push("/")}
                        />
                    )}
                    tools={() => (
                        <IconButton onClick={() => router.push("/profile")}>
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
};

const AnonymUserAppBar = ({ nav }: { nav: AppRouterInstance, title: ComponentType }) => {
    const theme = useTheme()
    const router = useRouter()
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
                        <IconButton onClick={() => router.push("/auth")} sx={{color: theme.palette.primary.contrastText}}>
                            <Typography>Войти</Typography>
                        </IconButton>
                    )}
                />
            )}
        />
    );
};
