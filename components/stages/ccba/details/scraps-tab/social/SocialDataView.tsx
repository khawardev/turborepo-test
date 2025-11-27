
'use client'
import { EmptyStateCard } from '@/components/shared/CardsUI';
import PlatformCard from './PlatformCard';

export default function SocialDataView({ socialScrapedData }: any) {

    if (!socialScrapedData || !socialScrapedData.social_platforms || socialScrapedData.social_platforms.length === 0) {
        return <EmptyStateCard message="No social media data available for this selection." />
    }

    return (
        <div className="columns-1 md:columns-2  gap-6">
            {socialScrapedData.social_platforms.map((platformData: any) => (
                <div key={platformData.platform} className="whitespace-normal mb-6">
                    <PlatformCard platformData={platformData} />
                </div>
            ))}
        </div>
    );
}