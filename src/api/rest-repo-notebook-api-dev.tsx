"use client";

import { Notebook, NotebookApi } from "./notebook-api";

export class RestRepoNotebookApiDev implements NotebookApi {
    private readonly apiGateway = process.env.NEXT_PUBLIC_API_GATEWAY!;

    create: (n: Notebook) => Promise<Notebook | null> = async (notebook) => {
        try {
            const rootResponse = await fetch(this.apiGateway);
            const root = await rootResponse.json();

            // 1. Находим ссылку на коллекцию пользователей
            const usersLink = root._links.users.href.replace(/\{.*?\}/g, "");

            // 2. Ищем пользователя по никнейму (если API не поддерживает прямой поиск, придётся грузить всех)
            const usersResponse = await fetch(usersLink);
            if (!usersResponse.ok)
                throw new Error("Не удалось загрузить пользователей, мудак");

            const usersData = await usersResponse.json();
            const targetUser = usersData._embedded?.users?.find(
                (u: any) => u.nickname === notebook.author
            );

            if (!targetUser)
                throw new Error("Такого пользователя нет, иди нахуй");

            // 3. Берём ссылку на этого пользователя
            const authorLink = targetUser._links.self.href;

            // 4. Формируем тело запроса в HAL-формате
            const halNotebook = {
                title: notebook.title,
                description: notebook.description,
                views: notebook.views,
                createdAt: notebook.createdAt.toISOString(),
                lastActiveAt: notebook.lastActiveAt.toISOString(),
                author: authorLink, // Важно: передаём ссылку, а не просто ник
            };

            // 5. Отправляем запрос
            const notebooksLink = root._links.notebooks.href.replace(
                /\{.*?\}/g,
                ""
            );
            const response = await fetch(notebooksLink, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(halNotebook),
            });

            if (!response.ok)
                throw new Error(`Сервер сгорел: ${response.status}`);

            const createdNotebook = await response.json();

            // 6. Возвращаем ноутбук в нужном формате
            return {
                id: createdNotebook._links.self.href.split("/").pop(),
                title: createdNotebook.title,
                author: notebook.author, // оставляем никнейм, а не ссылку
                description: createdNotebook.description,
                views: createdNotebook.views,
                createdAt: new Date(createdNotebook.createdAt),
                lastActiveAt: new Date(createdNotebook.lastActiveAt),
            };
        } catch (err) {
            console.error("Ошибка создания ноутбука:", err);
            return null;
        }
    };

    delete: (id: string) => Promise<void> = async (id) => {
        try {
            const rootResponse = await fetch(this.apiGateway);
            const root = await rootResponse.json();

            const notebookLink = root._links.notebooks.href.replace(/\{.*?\}/g, "")
            const response = await fetch(`${notebookLink}/${id}`, {
                method: "DELETE",
            });

            if (!response.ok)
                throw new Error(
                    "Не удалось удалить, иди проверяй свои кривые ссылки"
                );
        } catch (err) {
            console.error("Ошибка удаления:", err);
            throw err;
        }
    };

    get: (count: number, page: number) => Promise<Notebook[]> = async (
        count,
        page
    ) => {
        try {
            const rootResponse = await fetch(this.apiGateway);
            const root = await rootResponse.json();

            const notebooksLink = root._links.notebooks.href.replace(
                /\{.*?\}/g,
                ""
            );
            const paginatedLink = `${notebooksLink}?page=${page}&size=${count}`;

            const response = await fetch(paginatedLink);
            if (!response.ok) throw new Error("Сервер опять гонит");

            const data = await response.json();
            const notebooks = data._embedded?.notebooks || [];

            // Проходимся по каждому ноутбуку и дополняем данные
            const enrichedNotebooks = await Promise.all(
                notebooks.map(async (notebook: any) => {
                    // Достаём ID ноутбука из ссылки
                    const notebookId = notebook._links.self.href
                        .split("/")
                        .pop();

                    // Запрашиваем автора
                    const authorResponse = await fetch(
                        notebook._links.author.href
                    );
                    if (!authorResponse.ok)
                        throw new Error("Не удалось загрузить автора");
                    const authorData = await authorResponse.json();
                    const authorNickname = authorData.nickname;

                    return {
                        id: notebookId,
                        title: notebook.title,
                        author: authorNickname,
                        description: notebook.description,
                        views: notebook.views,
                        createdAt: new Date(notebook.createdAt),
                        lastActiveAt: notebook.lastActivity
                            ? new Date(notebook.lastActivity)
                            : new Date(0),
                    };
                })
            );

            return enrichedNotebooks;
        } catch (err) {
            console.error("Ошибка получения:", err);
            return [];
        }
    };
}
