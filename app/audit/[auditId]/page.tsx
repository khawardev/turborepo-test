import { getAuditById } from "@/actions/auditActions";
import { getCurrentUser } from "@/actions/userActions";
import AuditResults from "@/components/audit/AuditResults";
import { notFound } from "next/navigation";
import { companyReportQuestionnairePrompt, extractCompanyNamePrompt } from "@/lib/prompts";
import { generateNewContent } from "@/actions/generateContent";


async function generateQuestionnaire(auditContent: string) {
    'use server'
    const companyNamePrompt = extractCompanyNamePrompt({ company_report: auditContent, });
    const companyName = await generateNewContent(companyNamePrompt);

    const questionnaire = companyReportQuestionnairePrompt({ company_report: auditContent, company_name: companyName  });
    const result = await generateNewContent(questionnaire);
    
    return result;
}


const page = async ({ params }: any) => {
    const resolvedParams = await params;
    const auditId = resolvedParams?.auditId;
    const auditData = await getAuditById(auditId);
    const userData = await getCurrentUser();

    if (!auditData) {
        notFound();
    }
    return <AuditResults audit={auditData} user={userData} generateQuestionnaire={generateQuestionnaire} />;
};

export default page;
