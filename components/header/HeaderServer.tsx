import { getCurrentUser } from "@/server/actions/authActions"
import { HeaderClient } from "./HeaderClient"
import { redirect } from "next/navigation"

export default async function HeaderServer() {
    const user = await getCurrentUser()
    if (!user) {
        redirect('/')
    }
    return <HeaderClient user={user} />
}