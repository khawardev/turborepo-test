"use server";

import { db } from "@/db";
import { getSession } from "@/lib/auth/getSession";
import { desc, eq } from "drizzle-orm";
import { user } from "@/db/schema/users";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
    const session = await getSession();

    if (!session?.user?.id) {
        return null;
    }

    try {
        const currentUser = await db.query.user.findFirst({
            where: eq(user.id, session.user.id),
        });

        return currentUser ?? null;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
});

export const getUserWithAudits = cache(async () => {
    const session = await getSession();

    if (!session?.user?.id) {
        return null;
    }

    try {
        const userWithAudits = await db.query.user.findFirst({
            where: eq(user.id, session.user.id),
            with: {
                audits: {
                    orderBy: [desc(user.createdAt)],
                },
            },
        });
        return userWithAudits ?? null;
    } catch (error) {
        console.error("Error fetching user with audits:", error);
        return null;
    }
});