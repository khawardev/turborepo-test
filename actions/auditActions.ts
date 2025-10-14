"use server";

import { db } from "@/db";
import { getSession } from "@/lib/auth/getSession";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { user as userSchema } from "@/db/schema/users";
import { audit as auditSchema } from "@/db/schema/audits";
import { generateNewContent } from "./generateContent";
import { INITIAL_AUDIT_PROMPT } from "@/lib/prompts";
import { spiderCrawlWebsite } from "./spider-crawl";
import { analyzeToken, splitContentByTokens } from "@/lib/tokenizer";

const MAX_TOKENS = 1850000;

export async function createAudit(url: string) {
    const session = await getSession();
    if (!session?.user?.id) return { error: "You must be logged in to start an audit." };

    const currentUser = await db.query.user.findFirst({
        where: eq(userSchema.id, session.user.id),
        columns: { auditCredits: true },
    });

    if (!currentUser) return { error: "User not found." };
    if (currentUser.auditCredits <= 0) return { error: "You have no free reports remaining." };

    const [newAudit] = await db
        .insert(auditSchema)
        .values({
            userId: session.user.id,
            url,
        })
        .returning({ id: auditSchema.id });

    if (!newAudit?.id) return { error: "Failed to create audit record." };

    let crawlLimit = 10;
    let crawlResult: any = await spiderCrawlWebsite(url, crawlLimit);
    if (crawlResult.error) return { error: crawlResult.error };

    let tokenCount = analyzeToken(crawlResult.content);
    console.log(tokenCount, `<-> crawlResult tokenCount <->`);

    if (tokenCount > MAX_TOKENS) {
        const avgTokensPerPage = Math.ceil(tokenCount / crawlLimit);
        const safePageCount = Math.floor(MAX_TOKENS / avgTokensPerPage);
        crawlLimit = Math.max(1, safePageCount);

        console.log(`Token overflow detected! Avg per page: ${avgTokensPerPage}, safe pages: ${crawlLimit}`);

        crawlResult = await spiderCrawlWebsite(url, crawlLimit);
        if (crawlResult.error) return { error: crawlResult.error };

        tokenCount = analyzeToken(crawlResult.content);
        console.log(tokenCount, `<-> new crawlResult tokenCount after reducing limit <->`);
    }

    const processedContent = crawlResult.content;

    const prompt = INITIAL_AUDIT_PROMPT({
        website_url: url,
        crawledContent: processedContent,
        pagelimit: crawlLimit
    });

    const generatedResult = await generateNewContent(prompt);
    if (!generatedResult || generatedResult.errorReason)
        return { error: generatedResult?.errorReason || "Failed to generate audit." };

    const finalGeneratedContent = generatedResult.generatedText;

    try {
        await db.transaction(async (tx) => {
            await tx
                .update(auditSchema)
                .set({
                    status: "completed",
                    results: null,
                    crawledContent: processedContent,
                    auditGenratedContent: finalGeneratedContent,
                    updatedAt: new Date(),
                })
                .where(eq(auditSchema.id, newAudit.id));

            await tx
                .update(userSchema)
                .set({ auditCredits: sql`${userSchema.auditCredits} - 1` })
                .where(and(eq(userSchema.id, session.user.id), sql`${userSchema.auditCredits} > 0`));
        });

        revalidatePath(`/audit/${newAudit.id}`);
        revalidatePath("/");
        return { auditId: newAudit.id };
    } catch (error) {
        await db
            .update(auditSchema)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(auditSchema.id, newAudit.id));

        revalidatePath(`/audit/${newAudit.id}`);
        return { error: "An error occurred, please try again." };
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



// export async function createAudit(url: string) {
//     const session = await getSession();
//     if (!session?.user?.id) return { error: "You must be logged in to start an audit." };

//     const currentUser = await db.query.user.findFirst({
//         where: eq(userSchema.id, session.user.id),
//         columns: { auditCredits: true },
//     });

//     if (!currentUser) return { error: "User not found." };
//     if (currentUser.auditCredits <= 0) return { error: "You have no free reports remaining." };

//     const [newAudit] = await db
//         .insert(auditSchema)
//         .values({
//             userId: session.user.id,
//             url,
//         })
//         .returning({ id: auditSchema.id });

//     if (!newAudit?.id) return { error: "Failed to create audit record." };

//     const crawlResult: any = await spiderCrawlWebsite(url);
//     if (crawlResult.error) return { error: crawlResult.error };

//     const tokenCount = analyzeToken(crawlResult.content);
//     console.log(tokenCount, `<-> crawlResult tokenCount <->`);

//     let finalGeneratedContent = "";
//     const processedContent = crawlResult.content;

//     if (tokenCount > MAX_TOKENS) {
//         const contentChunks = splitContentByTokens(processedContent, MAX_TOKENS - 10000);
//         const partialResults: string[] = [];

//         for (let i = 0; i < contentChunks.length; i++) {
//             const partPrompt = INITIAL_AUDIT_PROMPT({
//                 website_url: url,
//                 crawledContent: contentChunks[i],
//             });

//             const result = await generateNewContent(partPrompt);
//             if (!result || result.errorReason)
//                 return { error: result?.errorReason || "Failed to generate partial audit." };

//             partialResults.push(result.generatedText);
//         }

//         const combinedPrompt = `
//             Combine the following partial audit analyses into one cohesive, detailed, and logically structured final audit report.

//             ${partialResults.map((r, i) => `--- PART ${i + 1} ---\n${r}`).join("\n\n")}

//             Make sure the final version avoids repetition and flows naturally as one complete analysis.
//         `;

//         const combinedResult = await generateNewContent(combinedPrompt);
//         if (!combinedResult || combinedResult.errorReason)
//             return { error: combinedResult?.errorReason || "Failed to combine partial audits." };

//         finalGeneratedContent = combinedResult.generatedText;
//     } else {
//         const prompt = INITIAL_AUDIT_PROMPT({
//             website_url: url,
//             crawledContent: processedContent,
//         });

//         const generatedResult = await generateNewContent(prompt);
//         if (!generatedResult || generatedResult.errorReason)
//             return { error: generatedResult?.errorReason || "Failed to generate audit." };

//         finalGeneratedContent = generatedResult.generatedText;
//     }

//     console.log(finalGeneratedContent, `<-> finalGeneratedContent <->`);

//     try {
//         await db.transaction(async (tx) => {
//             await tx
//                 .update(auditSchema)
//                 .set({
//                     status: "completed",
//                     results: null,
//                     crawledContent: processedContent,
//                     auditGenratedContent: finalGeneratedContent,
//                     updatedAt: new Date(),
//                 })
//                 .where(eq(auditSchema.id, newAudit.id));

//             await tx
//                 .update(userSchema)
//                 .set({ auditCredits: sql`${userSchema.auditCredits} - 1` })
//                 .where(and(eq(userSchema.id, session.user.id), sql`${userSchema.auditCredits} > 0`));
//         });

//         revalidatePath(`/audit/${newAudit.id}`);
//         revalidatePath("/");
//         return { auditId: newAudit.id };
//     } catch (error) {
//         await db
//             .update(auditSchema)
//             .set({ status: "failed", updatedAt: new Date() })
//             .where(eq(auditSchema.id, newAudit.id));

//         revalidatePath(`/audit/${newAudit.id}`);
//         return { error: "An error occurred, please try again." };
//     }
// }