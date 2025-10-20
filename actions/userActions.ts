"use server";

import { db } from "@/db";
import { getSession } from "@/lib/auth/getSession";
import { desc, eq, count } from "drizzle-orm";
import { user } from "@/db/schema/users";
import { audit } from "@/db/schema/audits";
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

export const getUserWithAudits = async ({ page = 1, pageSize = 9 } = {}) => {
    const session = await getSession();

    if (!session?.user?.id) {
        return null;
    }

    try {
        const currentUser = await db.query.user.findFirst({
            where: eq(user.id, session.user.id),
        });

        if (!currentUser) {
            return null;
        }

        const [totalAuditsResult, userAudits] = await Promise.all([
            db.select({ value: count() }).from(audit).where(eq(audit.userId, session.user.id)),
            db.query.audit.findMany({
                where: eq(audit.userId, session.user.id),
                orderBy: [desc(audit.createdAt)],
                limit: pageSize,
                offset: (page - 1) * pageSize,
            })
        ]);

        const totalAudits = totalAuditsResult[0]?.value ?? 0;

        return { ...currentUser, audits: userAudits, totalAudits };

    } catch (error) {
        console.error("Error fetching user with audits:", error);
        return null;
    }
};