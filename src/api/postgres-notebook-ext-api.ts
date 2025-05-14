"use client";

import { Notebook, NotebookApi } from "./notebook-api";
import { NotebookExtApi } from "./notebook-ext-api";

export class PostgresNotebookExtApi implements NotebookExtApi {
    private readonly apiBase = "/api/notebook";

    constructor(private notebookApi: NotebookApi) {}

    // Получение одного блокнота
    getOne = async (id: string): Promise<Notebook | null> => {
        const res = await fetch(`${this.apiBase}/get-one`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        return res.ok ? await res.json() : null;
    };

    // Обновление блокнота
    update = async (notebook: Notebook): Promise<void> => {
        await fetch(`${this.apiBase}/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notebook),
        });
    };

    // Остальные методы (прокидываются в notebookApi)
    create = async (n: Notebook): Promise<Notebook | null> => {
        return this.notebookApi.create(n);
    };

    delete = async (id: string): Promise<void> => {
        return this.notebookApi.delete(id);
    };

    get = async (count: number, page: number): Promise<Notebook[]> => {
        return this.notebookApi.get(count, page);
    };
}
