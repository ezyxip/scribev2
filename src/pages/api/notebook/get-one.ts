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
        // 1. Запрос к БД с JOIN, чтобы получить nickname автора
        const {
            rows: [notebook],
        } = await pool.query(
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
            return res.status(404).json({ error: "Notebook not found" });
        }

        // 2. Форматируем ответ для фронта
        const response = {
            id: notebook.id.toString(), // bigint -> string
            title: notebook.title,
            author: notebook.author || "unknown", // fallback, если автора нет
            description: notebook.description,
            views: Number(notebook.views), // bigint -> number
            createdAt: new Date(notebook.createdAt),
            lastActiveAt: new Date(notebook.lastActiveAt),
        };

        res.status(200).json(response);
    } catch (err) {
        console.error("Get notebook error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
