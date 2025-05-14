import pool from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Notebook ID is required" });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Удаляем все зависимости
        await client.query(
            `DELETE FROM notebook_permission WHERE object_id = $1`,
            [id]
        );
        // Можно добавить другие связанные таблицы

        // Удаляем основной объект
        await client.query(`DELETE FROM notebook WHERE id = $1`, [id]);

        await client.query("COMMIT");
        res.status(200).json({ success: true });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Delete notebook error:", err);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
};
