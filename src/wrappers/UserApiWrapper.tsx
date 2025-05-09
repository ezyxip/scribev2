'use client'

import { RestRepoUserApiDev } from "@/api/rest-repo-user-api-dev";
import { UserApi } from "@/api/user-api";
import { createContext, useContext } from "react";

export const userApiContext = createContext<UserApi | null>(null);

export const UserApiWrapper = ({children} : React.PropsWithChildren) => {
    return (
        <userApiContext.Provider value={new RestRepoUserApiDev()}>
            {children}
        </userApiContext.Provider>
    )
}

export const useUserApi = () => {
    const userApi = useContext(userApiContext)
    if(!userApi) throw "Не установлено API для работы с пользователем"
    return userApi
}