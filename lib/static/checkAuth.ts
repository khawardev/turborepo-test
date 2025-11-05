import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth() {
    const cookieStore = await cookies();
    const header = await headers();
    const accessToken = cookieStore.get('access_token')?.value;
    const pathname = header.get('next-url')

    if (!accessToken && pathname !== '/login') redirect('/login');

    return accessToken;
}