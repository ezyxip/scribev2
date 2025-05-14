"use client";

import { Cell as CellUI } from "@/utils/cell-ui";
import { Cell as RawCell } from "@/api/cell-api";
import { useCellTypes } from "@/wrappers/cell-types-wrapper";

export const useConvertCells = (rawCells: RawCell[]): CellUI[] => {
    const cellTypes = useCellTypes(); // Получаем все зарегистрированные типы ячеек

    return converterCellsWithoutHooks(rawCells, cellTypes);
};

export const converterCellsWithoutHooks = (
    rawCells: RawCell[],
    cellTypes: CellUI[]
): CellUI[] => {
    return rawCells
        .map((rawCell) => {
            // Находим соответствующий тип ячейки (например, "plain-text" → PlainTextCell)
            const cellType = cellTypes.find((type) => type.id === rawCell.type);

            if (!cellType) {
                console.warn(`Unknown cell type: ${rawCell.type}`);
                return null; // Или fallback-ячейку
            }

            // Возвращаем UI-ячейку с подставленным состоянием (content)
            return {
                ...cellType,
                id: rawCell.id,
                state: rawCell.content, // content из RawCell → state в CellUI
            };
        })
        .filter(Boolean) as CellUI[]; // Фильтруем возможные null (если тип не найден)
};
