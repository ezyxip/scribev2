// pages/api/notebook/get.ts
import pool from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET")
        return res.status(405).json({ error: "Only GET allowed" });

    const { count = 10, page = 1 } = req.query;
    console.log(count, page)
    const nickname = req.headers["x-user-nickname"]; // Теперь принимаем nickname

    if (!nickname || typeof nickname !== "string") {
        return res.status(400).json({ error: "Nickname is required" });
    }

    try {
        // 1. Находим user_id по nickname
        const { rows: userRows } = await pool.query(
            `SELECT id FROM users WHERE nickname = $1`,
            [nickname]
        );

        if (!userRows[0]) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = userRows[0].id;

        // 2. Получаем ноутбуки с доступом (прямым или через '*')
        const { rows } = await pool.query(
            `SELECT n.id, n.title, u.nickname as author, n.description,
                    n.views, n.created_at, n.last_activity
             FROM notebook n
             JOIN users u ON n.author_id = u.id
             WHERE n.id IN (
                 SELECT object_id FROM notebook_permission
                 WHERE subject_id = $1 AND action_name = 'read'
                 UNION
                 SELECT object_id FROM notebook_permission
                 WHERE subject_id IN (
                     SELECT id FROM users WHERE nickname = '*'
                 ) AND action_name = 'read'
             )
             ORDER BY n.last_activity DESC
             LIMIT $2 OFFSET $3`,
            [userId, count, (Number(page)) * Number(count)]
        );

        // 3. Форматируем под интерфейс Notebook
        const result = rows.map((row) => ({
            id: row.id.toString(),
            title: row.title,
            author: row.author,
            description: row.description,
            views: Number(row.views),
            createdAt: row.created_at,
            lastActiveAt: row.last_activity,
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error("Get notebooks error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
