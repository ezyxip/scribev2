import pool from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { notebookId, cellId } = req.query;

    switch (req.method) {
        // Получить конкретную ячейку
        case "GET":
            const {
                rows: [cell],
            } = await pool.query(
                `SELECT id, type, "order", content 
         FROM cells 
         WHERE id = $1 AND notebook_id = $2`,
                [cellId, notebookId]
            );
            if (!cell) return res.status(404).json({ error: "Cell not found" });
            return res.status(200).json(cell);

        // Обновить ячейку
        case "PUT":
            const { type, order, content } = req.body;
            const {
                rows: [updatedCell],
            } = await pool.query(
                `UPDATE cells 
         SET type = $1, "order" = $2, content = $3
         WHERE id = $4 AND notebook_id = $5
         RETURNING id, type, "order", content`,
                [type, order, JSON.stringify(content), cellId, notebookId]
            );
            if (!updatedCell)
                return res.status(404).json({ error: "Cell not found" });
            return res.status(200).json(updatedCell);

        // Удалить ячейку
        case "DELETE":
            const { rowCount } = await pool.query(
                `DELETE FROM cells 
         WHERE id = $1 AND notebook_id = $2`,
                [cellId, notebookId]
            );
            if (rowCount === 0)
                return res.status(404).json({ error: "Cell not found" });
            return res.status(204).end();

        default:
            return res.status(405).json({ error: "Method not allowed" });
    }
};
