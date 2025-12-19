"use server";

import { db } from "@/db";
import { getSession } from "@/lib/auth/getSession";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { user as userSchema, audit as auditSchema } from "@/db/schema";
import { COMPARISON_AUDIT_PROMPT, INITIAL_AUDIT_PROMPT, companyReportQuestionnairePrompt, extractCompanyNamePrompt } from "@/lib/prompts";
import { spiderCrawlWebsite } from "./spider-crawl";
import { analyzeToken } from "@/lib/tokenizer";
import { generateNewContent } from "./generateContent";

const MAX_TOKENS = 1850000;

export async function generateAndSaveQuestionnaire(auditId: string, auditContent: string) {
    const session = await getSession();
    if (!session?.user?.id) return { error: "You must be logged in." };

    try {
        const companyNamePrompt = extractCompanyNamePrompt({ company_report: auditContent });
        const companyNameResult = await generateNewContent(companyNamePrompt);
        const companyName = companyNameResult.generatedText || "Company";

        const questionnairePrompt = companyReportQuestionnairePrompt({ 
            company_report: auditContent, 
            company_name: companyName 
        });
        
        const result = await generateNewContent(questionnairePrompt);
        
        if (result.generatedText) {
            await db.update(auditSchema)
                .set({ 
                    questionnaireContent: result.generatedText,
                    updatedAt: new Date() 
                })
                .where(and(eq(auditSchema.id, auditId), eq(auditSchema.userId, session.user.id)));
            
            revalidatePath(`/audit/${auditId}`);
        }
        
        return result;
    } catch (error: any) {
        console.error("Error generating questionnaire:", error);
        return { generatedText: null, errorReason: error.message || "Failed to generate questionnaire." };
    }
}

export async function createAudit(url: string, competitorUrls: string[] = []) {
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
            competitorUrls: competitorUrls,
        })
        .returning({ id: auditSchema.id });

    if (!newAudit?.id) return { error: "Failed to create audit record." };

    try {
        // 1. Capture Brand Data
        let crawlLimit = 10;
        let brandCrawl: any = await spiderCrawlWebsite(url, crawlLimit);
        if (brandCrawl.error) throw new Error(brandCrawl.error);

        let brandContent = brandCrawl.content;
        const brandPageCount = brandCrawl.urls?.length || 0;

        // 2. Capture Competitor Data
        const competitorsData: { url: string; content: string }[] = [];
        const competitorsCrawledContent: Record<string, string> = {};

        if (competitorUrls.length > 0) {
            for (const compUrl of competitorUrls) {
                const compCrawl: any = await spiderCrawlWebsite(compUrl, 5); // Use 5 pages for competitors
                if (!compCrawl.error) {
                    competitorsData.push({ url: compUrl, content: compCrawl.content });
                    competitorsCrawledContent[compUrl] = compCrawl.content;
                }
            }
        }

        // 3. Generate Brand Audit Report
        const brandPrompt = INITIAL_AUDIT_PROMPT({
            website_url: url,
            crawledContent: brandContent,
            pagelimit: crawlLimit,
            actualPageCount: brandPageCount
        });

        const brandAuditResult = await generateNewContent(brandPrompt);
        if (!brandAuditResult || brandAuditResult.errorReason)
            throw new Error(brandAuditResult?.errorReason || "Failed to generate brand audit.");

        const finalBrandAuditContent = brandAuditResult.generatedText;

        // 4. Generate Comparison Report (if competitors exist)
        let comparisonReport = null;
        if (competitorsData.length > 0) {
            const comparisonPrompt = COMPARISON_AUDIT_PROMPT({
                brand_url: url,
                brand_content: brandContent,
                competitors: competitorsData
            });

            const comparisonResult = await generateNewContent(comparisonPrompt);
            if (comparisonResult && !comparisonResult.errorReason) {
                comparisonReport = comparisonResult.generatedText;
            }
        }

        // 5. Update Database
        await db.transaction(async (tx) => {
            await tx
                .update(auditSchema)
                .set({
                    status: "completed",
                    results: null,
                    crawledContent: brandContent,
                    auditGenratedContent: finalBrandAuditContent,
                    competitorsCrawledContent: competitorsCrawledContent,
                    comparisonReport: comparisonReport,
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

    } catch (error: any) {
        console.error("Audit creation failed:", error);
        await db
            .update(auditSchema)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(auditSchema.id, newAudit.id));

        revalidatePath(`/audit/${newAudit.id}`);
        return { error: error.message || "An error occurred, please try again." };
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