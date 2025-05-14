import { Notebook, NotebookApi } from "./notebook-api";
import { User } from "./user-api";

// Типы разрешений (должны совпадать с бэкендом)
export type PermissionAction = "read" | "write" | "delete";

// Права пользователя для конкретного ноутбука
export interface NotebookPermissions {
    notebookId: string;
    userId: string; // или "*" для любого пользователя
    actions: PermissionAction[];
}

// Результат проверки прав
export interface PermissionCheckResult {
    allowed: boolean;
    missingPermissions?: PermissionAction[];
}

export class PermissionManager {
    private readonly apiGateway: string;

    constructor(apiGateway: string) {
        this.apiGateway = apiGateway;
    }

    // ========================================================
    // Основные методы
    // ========================================================

    /**
     * Проверяет, есть ли у пользователя права на действие с ноутбуком.
     * @param userId Проверяемый пользователь (или "*" для любого).
     * @param notebookId Ноутбук, к которому проверяем доступ.
     * @param requiredActions Требуемые права (например, ["read", "write"]).
     */
    async checkPermissions(
        userId: string,
        notebookId: string,
        requiredActions: PermissionAction[]
    ): Promise<PermissionCheckResult> {
        // 1. Получаем все пермишены для ноутбука и пользователя
        const permissions = await this.getNotebookPermissions(notebookId);

        // 2. Ищем подходящие пермишены (для userId или "*")
        const userPermissions = permissions.filter(
            (p) => p.userId === userId || p.userId === "*"
        );

        // 3. Проверяем, хватает ли прав
        const missingActions = requiredActions.filter(
            (action) => !userPermissions.some((p) => p.actions.includes(action))
        );

        // 4. Если нет read, запрещаем всё остальное
        const isreadForbidden =
            requiredActions.includes("read") && missingActions.includes("read");

        return {
            allowed: missingActions.length === 0 && !isreadForbidden,
            missingPermissions: isreadForbidden ? ["read"] : missingActions,
        };
    }

    /**
     * Добавляет разрешение для пользователя.
     */
    async grantPermission(
        notebookId: string,
        userId: string,
        actions: PermissionAction[]
    ): Promise<void> {
        const root = await this.fetchRoot();
        const permissionsLink = this.getLink(root, "notebookPermissions");

        await fetch(permissionsLink, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                notebookId,
                userId,
                actions,
            }),
        });
    }

    // ========================================================
    // Вспомогательные методы (аналогично твоему коду)
    // ========================================================

    private async fetchRoot() {
        const response = await fetch(this.apiGateway);
        return response.json();
    }

    private getLink(resource: any, rel: string): string {
        if (!resource?._links?.[rel]?.href) {
            throw new Error(`Link ${rel} not found`);
        }
        return resource._links[rel].href;
    }

    private async getNotebookPermissions(
        notebookId: string
    ): Promise<NotebookPermissions[]> {
        const root = await this.fetchRoot();
        const permissionsLink = this.getLink(root, "notebookPermissions");
        const searchLink = `${permissionsLink}/search/findByNotebookId?notebookId=${notebookId}`;

        const response = await fetch(searchLink);
        if (!response.ok) throw new Error("Failed to fetch permissions");

        const data = await response.json();
        return data._embedded?.notebookPermissions || [];
    }
}

export class RestRepoNotebookPermsApiDev implements NotebookApi {
    private readonly apiGateway: string;
    private readonly currentUser: User;

    constructor(apiGateway: string, currentUser: User) {
        this.apiGateway = apiGateway;
        this.currentUser = currentUser;
    }

    // ==================== Основные методы ====================

    create = async (notebook: Notebook): Promise<Notebook | null> => {
        try {
            // 1. Получаем корень API
            const root = await this.fetchRoot();

            // 2. Находим пользователя по никнейму
            const authorLink = await this.findUserLink(notebook.author);

            // 3. Создаём ноутбук
            const notebooksLink = this.getLink(root, "notebooks");
            const response = await fetch(notebooksLink, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    title: notebook.title,
                    description: notebook.description,
                    views: notebook.views,
                    createdAt: notebook.createdAt.toISOString(),
                    lastActiveAt: notebook.lastActiveAt.toISOString(),
                    author: authorLink,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to create notebook: ${response.status}`
                );
            }

            const createdNotebook = await response.json();
            return this.mapHalNotebookToDomain(
                createdNotebook,
                notebook.author
            );
        } catch (error) {
            console.error("Create notebook failed:", error);
            return null;
        }
    };

    delete = async (id: string): Promise<void> => {
        try {
            // 1. Получаем ID пользователя из его nickname
            const userId = await this.getUserIdByNickname(
                this.currentUser.nickname
            );

            // 2. Проверяем права через PermissionManager
            const pm = new PermissionManager(this.apiGateway);
            const { allowed } = await pm.checkPermissions(userId, id, [
                "delete",
            ]);

            if (!allowed) {
                throw new Error("User doesn't have delete permission");
            }

            // 3. Удаляем ноутбук
            const root = await this.fetchRoot();
            const notebooksLink = this.getLink(root, "notebooks");
            const deleteUrl = `${notebooksLink}/${id}`;

            const response = await fetch(deleteUrl, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to delete notebook: ${response.status}`
                );
            }
        } catch (error) {
            console.error("Delete notebook failed:", error);
            throw error;
        }
    };

    get = async (count: number, page: number): Promise<Notebook[]> => {
        try {
            const root = await this.fetchRoot();
            const notebooksLink = this.getLink(root, "notebooks");
            const paginatedUrl = `${notebooksLink}?page=${page}&size=${count}`;

            const response = await fetch(paginatedUrl);
            if (!response.ok) throw new Error("Failed to fetch notebooks");

            const data = await response.json();
            const notebooks = data._embedded?.notebooks || [];

            // Фильтруем по правам READ для текущего пользователя
            const filteredNotebooks = await this.filterByReadPermission(
                notebooks,
                this.currentUser.nickname
            );

            // Обогащаем данные авторами
            return await Promise.all(
                filteredNotebooks.map((nb) => this.enrichNotebookWithAuthor(nb))
            );
        } catch (error) {
            console.error("Get notebooks failed:", error);
            return [];
        }
    };

    // ==================== Вспомогательные методы ====================

    private async fetchRoot() {
        const response = await fetch(this.apiGateway);
        if (!response.ok) throw new Error("Failed to fetch API root");
        return response.json();
    }

    private getLink(resource: any, rel: string): string {
        if (!resource?._links?.[rel]?.href) {
            throw new Error(`Link ${rel} not found`);
        }
        return resource._links[rel].href;
    }

    private async findUserLink(nickname: string): Promise<string> {
        const root = await this.fetchRoot();
        const usersLink = this.getLink(root, "users");
        const searchUrl = `${usersLink}/search/findByNickname?nickname=${encodeURIComponent(
            nickname
        )}`;

        const response = await fetch(searchUrl);
        if (!response.ok) throw new Error(`User ${nickname} not found`);

        const user = await response.json();
        return user._links.self.href;
    }

    private async getUserIdByNickname(nickname: string): Promise<string> {
        const userLink = await this.findUserLink(nickname);
        return userLink.split("/").pop() || "";
    }

    private async filterByReadPermission(
        notebooks: any[],
        nickname: string
    ): Promise<any[]> {
        const pm = new PermissionManager(this.apiGateway);
        const userId = await this.getUserIdByNickname(nickname);

        const results = await Promise.all(
            notebooks.map(async (nb) => {
                const notebookId = this.extractIdFromUrl(nb._links.self.href);
                const { allowed } = await pm.checkPermissions(
                    userId,
                    notebookId,
                    ["read"]
                );
                return allowed ? nb : null;
            })
        );

        return results.filter(Boolean);
    }

    private async enrichNotebookWithAuthor(
        halNotebook: any
    ): Promise<Notebook> {
        const authorResponse = await fetch(halNotebook._links.author.href);
        if (!authorResponse.ok) throw new Error("Failed to fetch author");
        const author = await authorResponse.json();

        return {
            id: this.extractIdFromUrl(halNotebook._links.self.href),
            title: halNotebook.title,
            author: author.nickname,
            description: halNotebook.description,
            views: halNotebook.views,
            createdAt: new Date(halNotebook.createdAt),
            lastActiveAt: new Date(halNotebook.lastActiveAt),
        };
    }

    private extractIdFromUrl(url: string): string {
        return url.split("/").pop() || "";
    }

    private mapHalNotebookToDomain(
        halNotebook: any,
        authorNickname: string
    ): Notebook {
        return {
            id: this.extractIdFromUrl(halNotebook._links.self.href),
            title: halNotebook.title,
            author: authorNickname,
            description: halNotebook.description,
            views: halNotebook.views,
            createdAt: new Date(halNotebook.createdAt),
            lastActiveAt: new Date(halNotebook.lastActiveAt),
        };
    }
}
