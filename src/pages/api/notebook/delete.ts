// pages/api/notebook/delete.ts
import pool from '@/utils/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

    const { id } = req.body;
    const userId = req.headers['x-user-id']; // Предполагаем, что ID пользователя передаётся

    try {
        // 1. Проверяем право на удаление
        const { rows: [permission] } = await pool.query(
            `SELECT 1 FROM notebook_permission
             WHERE object_id = $1 AND subject_id = $2 AND action_name = 'delete'`,
            [id, userId]
        );

        if (!permission) {
            return res.status(403).json({ error: 'No delete permission' });
        }

        // 2. Удаляем
        await pool.query(`DELETE FROM notebook WHERE id = $1`, [id]);

        res.status(200).json({});

    } catch (err) {
        console.error('Delete notebook error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};