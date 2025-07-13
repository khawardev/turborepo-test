import { getAuditById } from "@/actions/auditActions";
import { getCurrentUser } from "@/actions/userActions";
import AuditResults from "@/components/audit/AuditResults";
import { notFound } from "next/navigation";

export default async function AuditPage({ params }: { params: { auditId: string } }) {
    const { auditId } = await params;
    const auditData = await getAuditById(auditId);
    const userData = await getCurrentUser();

    if (!auditData) {
        notFound();
    }

    return <AuditResults audit={auditData} user={userData} />;
}