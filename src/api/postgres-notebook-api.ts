"use client";
import { Notebook, NotebookApi } from "./notebook-api";

export class PostgresNotebookApi implements NotebookApi {
    private readonly apiBase = "/api/notebook";

    create = async (
        notebook: Omit<Notebook, "id" | "views" | "createdAt" | "lastActiveAt">
    ) => {
        const res = await fetch(`${this.apiBase}/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notebook),
        });
        return res.ok ? await res.json() : null;
    };

    delete = async (id: string) => {
        await fetch(`${this.apiBase}/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
    };

    get = async (count: number, page: number) => {
        const useNickname = localStorage.getItem("currentUser"); // Или из стора (Redux/Zustand)
        // if (!useNickname) throw new Error("User ID not found");

        const res = await fetch(
            `${this.apiBase}/get?count=${count}&page=${page}`,
            {
                headers: {
                    "x-user-nickname": useNickname || "", // <- Вот так передаём
                },
            }
        );
        return res.ok ? await res.json() : [];
    };
}
