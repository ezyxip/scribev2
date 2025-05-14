// pages/api/notebook/create.ts
import pool from '@/utils/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

    const { title, author, description } = req.body;

    try {
        // 1. Находим ID автора по nickname
        const { rows: [user] } = await pool.query(
            `SELECT id FROM users WHERE nickname = $1`, 
            [author]
        );
        if (!user) throw new Error('Author not found');

        // 2. Создаём блокнот
        const { rows: [notebook] } = await pool.query(
            `INSERT INTO notebook 
             (title, description, author_id, created_at, last_activity, views)
             VALUES ($1, $2, $3, NOW(), NOW(), 0)
             RETURNING id, title, created_at, last_activity`,
            [title, description, user.id]
        );

        // 3. Даём права автору (read, write, delete)
        await pool.query(
            `INSERT INTO notebook_permission 
             (action_name, object_id, subject_id)
             VALUES ('read', $1, $2), ('write', $1, $2), ('delete', $1, $2)`,
            [notebook.id, user.id]
        );

        // 4. Возвращаем в формате, который ожидает UI
        res.status(201).json({
            id: notebook.id.toString(), // bigint -> string
            title: notebook.title,
            author,
            description,
            views: 0,
            createdAt: notebook.created_at,
            lastActiveAt: notebook.last_activity
        });

    } catch (err) {
        console.error('Create notebook error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};