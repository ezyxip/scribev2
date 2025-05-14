import pool from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { notebookId } = req.query;

    switch (req.method) {
        // Получить все ячейки блокнота
        case "GET":
            const { rows } = await pool.query(
                `SELECT id, type, "order", content 
         FROM cells 
         WHERE notebook_id = $1 
         ORDER BY "order" ASC`,
                [notebookId]
            );
            return res.status(200).json(rows);

        // Создать новую ячейку
        case "POST":
            const { type, order, content } = req.body;
            const {
                rows: [cell],
            } = await pool.query(
                `INSERT INTO cells 
         (type, "order", content, notebook_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, type, "order", content`,
                [type, order, JSON.stringify(content), notebookId]
            );
            return res.status(201).json(cell);

        default:
            return res.status(405).json({ error: "Method not allowed" });
    }
};
