'use client'

import { PostgresUserApi } from "@/api/postgres-user-api";
import { RestRepoUserApiDev } from "@/api/rest-repo-user-api-dev";
import { UserApi } from "@/api/user-api";
import { createContext, useContext } from "react";

export const userApiContext = createContext<UserApi | null>(null);

export const UserApiWrapper = ({children} : React.PropsWithChildren) => {
    return (
        <userApiContext.Provider value={new PostgresUserApi()}>
            {children}
        </userApiContext.Provider>
    )
}

export const useUserApi = () => {
    const userApi = useContext(userApiContext)
    if(!userApi) throw "Не установлено API для работы с пользователем"
    return userApi
}