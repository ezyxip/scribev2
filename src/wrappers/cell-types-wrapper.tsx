'use client'

import { AudioCell } from "@/cell-types/audio-cell";
import { FileCell } from "@/cell-types/file-cell";
import { ImageGalleryCell } from "@/cell-types/gallery-cell";
import { MarkdownCell } from "@/cell-types/markdown-cell";
import { PlainTextCell } from "@/cell-types/plain-text-cell";
import { VideoCell } from "@/cell-types/video-cell";
import { HighlightedTextCell } from "@/cell-types/warning-cell";
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
    cells["markdown"] = {...MarkdownCell}
    cells["highlighted"] = {...HighlightedTextCell}
    cells["file-storage"] = {...FileCell}
    cells["gallery"] = {...ImageGalleryCell}
    cells["audio"] = {...AudioCell}
    cells["video"] = {...VideoCell}

    return props.children
}

export const useCellTypes = () => Object.values(useContext(cellTypeContext))