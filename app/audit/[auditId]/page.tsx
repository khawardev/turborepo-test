import { getAuditById, generateAndSaveQuestionnaire } from "@/db/actions/auditActions";
import { getCurrentUser } from "@/db/actions/userActions";
import AuditResults from "@/components/audit/AuditResults";
import { notFound } from "next/navigation";

const page = async ({ params }: any) => {
    const resolvedParams = await params;
    const auditId = resolvedParams?.auditId;
    const auditData = await getAuditById(auditId);
    const userData = await getCurrentUser();

    if (!auditData) {
        notFound();
    }

    return <AuditResults audit={auditData} user={userData} generateQuestionnaire={generateAndSaveQuestionnaire} />;
};

export default page;
