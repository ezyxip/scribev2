'use client'

import { CellApi } from "@/api/cell-api";
import { PostgresCellApiDev } from "@/api/postgres-cell-api-dev";
import { createContext, useContext } from "react";

export const cellApiContext = createContext<CellApi | null>(null);

export const CellApiWrapper = ({children} : React.PropsWithChildren) => {
    return (
        <cellApiContext.Provider value={new PostgresCellApiDev()}>
            {children}
        </cellApiContext.Provider>
    )
}

export const useCellApi = () => {
    const cellApi = useContext(cellApiContext)
    if(!cellApi) throw "Не установлено API для работы с ячейками"
    return cellApi
}