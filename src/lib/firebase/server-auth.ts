
import { cookies } from 'next/headers';
import 'server-only';

export async function getUidFromCookie() {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('firebase-token');
    if (!tokenCookie) {
        return null;
    }
    try {
        const token = JSON.parse(tokenCookie.value);
        return token.uid;
    } catch(e) {
        console.error("Failed to parse firebase token from cookie", e);
        return null;
    }
}
