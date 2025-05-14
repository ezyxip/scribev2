import pool from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: "Missing notebook ID" });
    }

    try {
        // Начинаем транзакцию
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // 1. Увеличиваем счетчик просмотров
            await client.query(
                `UPDATE notebook SET views = views + 1 
                 WHERE id = $1`,
                [id]
            );

            // 2. Получаем обновленные данные ноутбука
            const {
                rows: [notebook],
            } = await client.query(
                `SELECT 
                    n.id, 
                    n.title, 
                    u.nickname as author, 
                    n.description, 
                    n.views, 
                    n.created_at as "createdAt", 
                    n.last_activity as "lastActiveAt",
                    n.author_id
                 FROM notebook n
                 LEFT JOIN users u ON n.author_id = u.id 
                 WHERE n.id = $1`,
                [id]
            );

            if (!notebook) {
                await client.query("ROLLBACK");
                return res.status(404).json({ error: "Notebook not found" });
            }

            await client.query("COMMIT");

            // 3. Форматируем ответ для фронта
            const response = {
                id: notebook.id.toString(),
                title: notebook.title,
                author: notebook.author || "unknown",
                description: notebook.description,
                views: (Number(notebook.views)),
                createdAt: new Date(notebook.createdAt),
                lastActiveAt: new Date(notebook.lastActiveAt),
            };

            res.status(200).json(response);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Get notebook error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
