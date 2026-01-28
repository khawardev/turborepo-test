'use server';

import { prepareGoogleSlidesExportData } from '@/lib/brandos-v2.1/markdownToSlides';
import { parseWebSynthesisMarkdown } from '@/lib/brandos-v2.1/markdownToWebSynthesisSlides';

type ExportToPPTXParams = {
    social_report: string;
    entity_name: string;
    channel_name: string;
};

type ExportWebSynthesisToPPTXParams = {
    synthesis_report: string;
    entity_name: string;
};

type ExportResult = {
    success: boolean;
    data?: {
        blob?: Blob;
        filename?: string;
        download_url?: string;
    };
    error?: string;
};

export async function exportToGoogleSlides(params: ExportToPPTXParams): Promise<ExportResult> {
    const {
        social_report,
        entity_name,
        channel_name,
    } = params;

    if (!social_report || typeof social_report !== 'string') {
        return {
            success: false,
            error: 'No report content provided'
        };
    }

    try {
        const exportData = prepareGoogleSlidesExportData(social_report);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        
        const response = await fetch(`${baseUrl}/api/pptx/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                entity_name,
                channel_name,
                export_data: exportData
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error || `Export failed with status ${response.status}`
            };
        }

        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : `${entity_name}_Report.pptx`;

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return {
            success: true,
            data: {
                download_url: `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64}`,
                filename: filename
            }
        };
    } catch (error: any) {
        console.error('Export to PPTX error:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred'
        };
    }
}

export async function exportWebSynthesisToSlides(params: ExportWebSynthesisToPPTXParams): Promise<ExportResult> {
    const { synthesis_report, entity_name } = params;

    if (!synthesis_report || typeof synthesis_report !== 'string') {
        return {
            success: false,
            error: 'No synthesis report content provided'
        };
    }

    try {
        const exportData = parseWebSynthesisMarkdown(synthesis_report);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        
        const response = await fetch(`${baseUrl}/api/pptx/web-synthesis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                entity_name,
                export_data: exportData
            }),
        });

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error || `Export failed with status ${response.status}`
            };
        }

        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : `${entity_name}_Web_Synthesis.pptx`;

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return {
            success: true,
            data: {
                download_url: `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64}`,
                filename: filename
            }
        };

    } catch (error: any) {
        console.error('Export Web Synthesis to PPTX error:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred'
        };
    }
}

export async function exportToPPTX(params: ExportToPPTXParams): Promise<ExportResult> {
    return exportToGoogleSlides(params);
}
