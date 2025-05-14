"use client";

import { Cell, CellApi } from "./cell-api";

export class PostgresCellApiDev implements CellApi {
    async get(notebookiId: string): Promise<Cell[]> {
        const response = await fetch(`/api/cells/${notebookiId}`);
        if (!response.ok)
            throw new Error(`Failed to fetch: ${response.status}`);
        return response.json();
    }

    async create(notebookiId: string, cell: Cell): Promise<Cell> {
        const response = await fetch(`/api/cells/${notebookiId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cell),
        });
        if (!response.ok)
            throw new Error(`Failed to create: ${response.status}`);
        return response.json(); // Теперь возвращаем созданную хуйню
    }

    async update(notebookiId: string, cell: Cell): Promise<Cell> {
        const response = await fetch(`/api/cells/${notebookiId}/${cell.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cell),
        });
        if (!response.ok)
            throw new Error(`Failed to update: ${response.status}`);
        return response.json(); // И здесь тоже возвращаем обновлённый кусок дерьма
    }

    async delete(notebookiId: string, cellId: string): Promise<void> {
        const response = await fetch(`/api/cells/${notebookiId}/${cellId}`, {
            method: "DELETE",
        });
        if (!response.ok)
            throw new Error(`Failed to delete: ${response.status}`);
        // Здесь нихуя не возвращаем, как и просили
    }
}
