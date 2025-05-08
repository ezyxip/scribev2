import { User, getCurrentUser } from "@/api/user-api";
import { useState, useEffect } from "react";

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true; // <- флаг для проверки монтирования

        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                if (isMounted) setUser(userData); // <- обновляем только если компонент живой
            } catch (err: any) {
                if (isMounted) setError(err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchUser();

        return () => {
            isMounted = false; // <- при размонтировании запрещаем обновления
        };
    }, []);

    return { user, isLoading, error };
};
