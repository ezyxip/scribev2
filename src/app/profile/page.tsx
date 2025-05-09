'use client'

import LoadingSpinner from "@/components/loader-mock";
import ErrorModal from "@/components/modal-error-alert";
import { ProfileAppBar } from "@/components/profile-bar";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";

export default function ProfilePage(){
    const {isLoading, user, error} = useUser()
    const router = useRouter()
    if(isLoading) return <LoadingSpinner/>
    if(error){
        return <ErrorModal error={error} onClose={router.back}/>
    }
    return (
        <ProfileAppBar nickname={user!.nickname}/>
    )
}