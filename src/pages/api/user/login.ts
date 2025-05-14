// pages/api/user/login.ts
import pool from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") return res.status(405).end();

    const { nickname, password } = req.body;

    try {
        // 1. Ищем пользователя
        const { rows: userRows } = await pool.query(
            `SELECT u.id, u.nickname 
             FROM users u
             JOIN user_secure us ON u.id = us.user_id
             WHERE u.nickname = $1 AND us.password = $2`,
            [nickname, password]
        );

        if (!userRows[0]) {
            return res.status(401).json({ error: "Неверный логин/пароль" });
        }

        // 2. Обновляем last_login_at (опционально)
        await pool.query(
            `UPDATE user_secure SET last_login_at = NOW() WHERE user_id = $1`,
            [userRows[0].id]
        );

        // Возвращаем только nickname (как в старом API)
        res.status(200).json({ nickname: userRows[0].nickname });
    } catch (err) {
        console.error("Ошибка входа:", err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};