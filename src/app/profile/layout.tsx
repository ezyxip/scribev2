'use client'

import LoadingSpinner from "@/components/loader-mock";
import ErrorModal from "@/components/modal-error-alert";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const {isLoading, user, error} = useUser()

    if (isLoading) {
        return <LoadingSpinner/>
    }

    if(error){
        return <ErrorModal error={error} onClose={router.back}/>
    }

    if (!user) {
        router.push("/auth")
        return <LoadingSpinner/>;
    }

    return <>{children}</>;
};

export default AuthLayout