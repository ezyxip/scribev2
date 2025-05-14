import { Notebook, NotebookApi } from "./notebook-api";
import { User } from "./user-api";

export class RestRepoNotebookApiForCurrentUserOnlyDev implements NotebookApi {
    constructor(
        private currentUser: User,
        private originalNotebookApi: NotebookApi // Встраиваем оригинальный API
    ) {}

    create: (n: Notebook) => Promise<Notebook | null> = async (notebook) => {
        if (notebook.author !== this.currentUser.nickname) {
            throw new Error(
                "Ты не можешь создавать ноутбуки за другого пользователя, мудак!"
            );
        }
        return this.originalNotebookApi.create(notebook);
    };

    delete: (id: string) => Promise<void> = async (id) => {
        // Сначала получаем ноутбук, чтобы проверить автора
        const allNotebooks = await this.originalNotebookApi.get(100, 0); // Костыль: грузим все, т.к. нет метода getById
        const targetNotebook = allNotebooks.find((n) => n.id === id);

        if (!targetNotebook) {
            throw new Error("Ноутбук не найден, иди проверь ID, долбоёб");
        }

        if (targetNotebook.author !== this.currentUser.nickname) {
            throw new Error("Это не твой ноутбук, воришка!");
        }

        await this.originalNotebookApi.delete(id);
    };

    get: (count: number, page: number) => Promise<Notebook[]> = async (
        count,
        page
    ) => {
        const allNotebooks = await this.originalNotebookApi.get(count, page);
        return allNotebooks.filter(
            (notebook) => notebook.author === this.currentUser.nickname
        );
    };
}
