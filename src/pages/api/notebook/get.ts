// pages/api/notebook/get.ts
import pool from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Only GET allowed" });
    }

    const { count = 100, page = 0 } = req.query;

    try {
        // Получаем все ноутбуки без проверки пермишенсов
        const { rows } = await pool.query(
            `SELECT n.id, n.title, u.nickname as author, n.description,
                    n.views, n.created_at, n.last_activity
             FROM notebook n
             JOIN users u ON n.author_id = u.id
             ORDER BY n.last_activity DESC
             LIMIT $1 OFFSET $2`,
            [count, Number(page) * Number(count)]
        );

        // Форматируем под интерфейс Notebook
        const result = rows.map((row) => ({
            id: row.id.toString(),
            title: row.title,
            author: row.author,
            description: row.description,
            views: Number(row.views) ,
            createdAt: row.created_at,
            lastActiveAt: row.last_activity,
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error("Get notebooks error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
