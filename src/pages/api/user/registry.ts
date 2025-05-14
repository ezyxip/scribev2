// pages/api/user/registry.ts
import pool from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") return res.status(405).end();

    const { nickname, password, email, phone } = req.body;

    try {
        // 1. Создаём пользователя
        const { rows: userRows } = await pool.query(
            `INSERT INTO users (nickname) VALUES ($1) RETURNING id, nickname`,
            [nickname]
        );

        // 2. Добавляем пароль
        await pool.query(
            `INSERT INTO user_secure (user_id, password) VALUES ($1, $2)`,
            [userRows[0].id, password]
        );

        // 3. Добавляем контакты (если есть)
        if (email || phone) {
            await pool.query(
                `INSERT INTO user_contacts (user_id, email, phone) VALUES ($1, $2, $3)`,
                [userRows[0].id, email || null, phone || null]
            );
        }

        // Возвращаем только nickname (как в старом API)
        res.status(200).json({ nickname: userRows[0].nickname });
    } catch (err) {
        console.error("Ошибка регистрации:", err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};