"use server";

import { db } from "@/db";
import { getSession } from "@/lib/auth/getSession";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { user as userSchema } from "@/db/schema/users";
import { audit as auditSchema } from "@/db/schema/audits";
import { crawlWebsite } from "./crawl";
import { generateNewContent } from "./generateContent";
import { INITIAL_AUDIT_PROMPT } from "@/lib/prompts";
import { cleanAndFlattenBulletsGoogle } from "@/lib/cleanMarkdown";

export async function createAudit(url: string) {
    const session = await getSession();
    if (!session?.user?.id) {
        return { error: "You must be logged in to start an audit." };
    }

    const currentUser = await db.query.user.findFirst({
        where: eq(userSchema.id, session.user.id),
        columns: { auditCredits: true }
    });

    if (!currentUser) {
        return { error: "User not found." };
    }

    if (currentUser.auditCredits <= 0) {
        return { error: "You have no free reports remaining." };
    }

    const [newAudit] = await db.insert(auditSchema).values({
        userId: session.user.id,
        url,
    }).returning({ id: auditSchema.id });

    if (!newAudit?.id) {
        return { error: "Failed to create audit record." };
    }

    await new Promise(resolve => setTimeout(resolve, 4000));

    if (url.includes("fail-test.com")) {
        await db.update(auditSchema)
            .set({ status: 'failed', updatedAt: new Date() })
            .where(eq(auditSchema.id, newAudit.id));
        revalidatePath(`/audit/${newAudit.id}`);
        return { auditId: newAudit.id }; 
    }
    const crawlResult = await crawlWebsite(url);
    if (crawlResult.error) {
        console.error("Analysis failed:", crawlResult.error);
        return { error: crawlResult.error };
    }

    const prompt = INITIAL_AUDIT_PROMPT({
        website_url: url,
        crawledContent: crawlResult.content,
    });
    const generatedResult = await generateNewContent(prompt)
    const cleanedMarkdown = cleanAndFlattenBulletsGoogle(generatedResult.generatedText)

    const mockResults = {
        seoScore: Math.floor(Math.random() * (95 - 70 + 1) + 70),
        performanceScore: Math.floor(Math.random() * (98 - 65 + 1) + 65),
        accessibilityScore: Math.floor(Math.random() * (92 - 75 + 1) + 75),
        bestPracticesScore: Math.floor(Math.random() * (99 - 80 + 1) + 80),
    };

    try {
        await db.transaction(async (tx) => {
            await tx.update(auditSchema)
                .set({ status: 'completed', results: mockResults, crawledContent: crawlResult.content, auditGenratedContent: cleanedMarkdown,  updatedAt: new Date() })
                .where(eq(auditSchema.id, newAudit.id));

            await tx.update(userSchema)
                .set({ auditCredits: sql`${userSchema.auditCredits} - 1` })
                .where(and(eq(userSchema.id, session.user.id), sql`${userSchema.auditCredits} > 0`));
        });

        revalidatePath(`/audit/${newAudit.id}`);
        revalidatePath('/'); 
        return { auditId: newAudit.id };

    } catch (error) {
        console.error("Transaction failed:", error);
        await db.update(auditSchema)
            .set({ status: 'failed', updatedAt: new Date() })
            .where(eq(auditSchema.id, newAudit.id));
        revalidatePath(`/audit/${newAudit.id}`);
        return { error: "An error occurred , Please try again." };
    }
}

export async function getAuditById(auditId: string) {
    const session = await getSession();
    if (!session?.user?.id) {
        return null;
    }
    try {
        const result = await db.query.audit.findFirst({
            where: and(eq(auditSchema.id, auditId), eq(auditSchema.userId, session.user.id)),
        });
        return result ?? null;
    } catch (error) {
        console.error("Error fetching audit:", error);
        return null;
    }
}