
import SetupForm from '@/components/brandos-v2.1/SetupForm';
import { DashboardLayoutHeading } from '@/components/brandos-v2.1/shared/DashboardComponents';

export default function SetupPage() {
    return <>
        <DashboardLayoutHeading
            title="New Engagement Setup"
            subtitle="Define scope, competitive frame, and analysis parameters."
        />
        <SetupForm />

    </>
}
