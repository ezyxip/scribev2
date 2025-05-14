'use client'

import { PlainTextCell } from "@/cell-types/plain-text-cell";
import { Cell } from "@/utils/cell-ui";
import { createContext, PropsWithChildren, use, useContext } from "react";

const cellTypeContext = createContext<Record<string, Cell>>({})

export const CellWrapper = (props: PropsWithChildren) => {
    return (
        <cellTypeContext.Provider value={{}}>
            <CellRegistratorWrapper>{props.children}</CellRegistratorWrapper>
        </cellTypeContext.Provider>
    )
}

const CellRegistratorWrapper = (props: PropsWithChildren) => {
    const cells = useContext(cellTypeContext);

    cells["plain-text"] = {...PlainTextCell}

    return props.children
}

export const useCellTypes = () => Object.values(useContext(cellTypeContext))