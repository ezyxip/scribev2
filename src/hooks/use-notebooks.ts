import { Notebook } from "@/api/notebook-api";
import { useNotebookApi } from "@/wrappers/UseNotebookApiWrapper";
import { useState, useMemo, useEffect } from "react";
import { useUser } from "./use-user";

export const useNotebooks = (page: number, count: number) => {
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const {isLoading: userLoading, error: userError, user} = useUser()
    const notebookApi = useNotebookApi();

    const addNotebook = async () => {
        const newNotebook: Notebook = {
            id: Date.now().toString(),
            title: `Новый ноутбук`,
            author: user?.nickname || "current_user",
            description: "Описание нового ноутбука",
            createdAt: new Date(),
            lastActiveAt: new Date(),
            views: 0,
        };
        try {
            let n = await notebookApi.create(newNotebook);
            if (!n) throw "Таки не создалось"
            setNotebooks([...notebooks, n]);
        } catch (e: any) {
            setError(e);
        }
    };

    const deleteNotebook = (id: string) => {
        try {
            notebookApi.delete(id)
            setNotebooks(notebooks.filter((n) => n.id !== id));
        } catch (e: any) {
            setError(e)
        }
    };

    useEffect(() => {
        let isMounted = true;

        const fetchNotebooks = async () => {
            try {
                setIsLoading(true);
                const fetchedNotebooks = await notebookApi.get(count, page); // 10 записей, 0 страница
                if (isMounted) {
                    setNotebooks(fetchedNotebooks);
                    setError(null);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err);
                    console.error("Ошибка загрузки ноутбуков:", err);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchNotebooks();

        return () => {
            isMounted = false;
        };
    }, [notebookApi]);

    return { notebooks, addNotebook, deleteNotebook, isLoading: isLoading && userLoading, error: error || userError };
};
