import pool from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    const { id, title, description } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Missing notebook ID" });
    }

    try {
        // 1. Проверяем, существует ли блокнот
        const {
            rows: [existingNotebook],
        } = await pool.query(`SELECT id FROM notebook WHERE id = $1`, [id]);

        if (!existingNotebook) {
            return res.status(404).json({ error: "Notebook not found" });
        }

        // 2. Обновляем данные
        await pool.query(
            `UPDATE notebook 
             SET 
                title = COALESCE($1, title), 
                description = COALESCE($2, description),
                last_activity = NOW()
             WHERE id = $3`,
            [title, description, id]
        );

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Update notebook error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
