import { User, UserApi, userApi } from "@/api/user-api";
import { userApiContext, useUserApi } from "@/wrappers/UserApiWrapper";
import { useState, useEffect, useContext } from "react";

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const userApi = useUserApi();

    useEffect(() => {
        let isMounted = true; // <- флаг для проверки монтирования
        const userService = userApi
        const fetchUser = async () => {
            try {
                const userData = await userService.current();
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
