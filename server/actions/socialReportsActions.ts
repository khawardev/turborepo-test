'use server';

import { agentRequest } from "../api/agentRequest";

export type SocialChannelName = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube' | 'tiktok';
export type AnalysisScope = 'brand' | 'competitors';

export interface RunSocialReportsParams {
    client_id: string;
    brand_id: string;
    batch_id: string;
    channel_name: SocialChannelName;
    analysis_scope?: AnalysisScope;
    competitor_id?: string;
    instruction?: string;
}

export interface GetSocialReportsOutputParams {
    client_id: string;
    brand_id: string;
    task_id: string;
}

export interface ListSocialReportsTasksParams {
    client_id: string;
    brand_id: string;
}

export interface DeleteSocialReportsTaskParams {
    client_id: string;
    brand_id: string;
    task_id: string;
}

export interface SocialReportsRunOutput {
    task_id: string;
    social_report: string;
    entity_name: string;
    analysis_scope: string;
}

export interface SocialReportsTaskOutput {
    task_id: string;
    client_id: string;
    brand_id: string;
    entity_name: string;
    analysis_scope: string;
    social_report: string;
    batch_id: string;
    model_used: string;
    timestamp: string;
    execution_time_seconds: number;
}

export interface SocialReportsTaskListItem {
    task_id: string;
    entity_name: string;
    analysis_scope: string;
    timestamp: string;
    model_used: string;
    batch_id: string;
    scraped_urls_count: number;
    execution_time_seconds: number;
}

export interface SocialReportsTaskListOutput {
    tasks: SocialReportsTaskListItem[];
    count: number;
}

export async function runSocialReportsAgent(params: RunSocialReportsParams) {
    const queryParams = new URLSearchParams({
        client_id: params.client_id,
        brand_id: params.brand_id,
        batch_id: params.batch_id,
        channel_name: params.channel_name,
    });

    if (params.analysis_scope) queryParams.append('analysis_scope', params.analysis_scope);
    if (params.competitor_id) queryParams.append('competitor_id', params.competitor_id);
    if (params.instruction) queryParams.append('instruction', params.instruction);

    return await agentRequest(`/run-social-reports-agent?${queryParams.toString()}`, 'POST');
}

export async function getSocialReportsOutput(params: GetSocialReportsOutputParams) {
    const queryParams = new URLSearchParams({
        client_id: params.client_id,
        brand_id: params.brand_id,
        task_id: params.task_id,
    });

    return await agentRequest(`/get-social-reports-output?${queryParams.toString()}`, 'GET');
}

export async function listSocialReportsTasks(params: ListSocialReportsTasksParams) {
    const queryParams = new URLSearchParams({
        client_id: params.client_id,
        brand_id: params.brand_id,
    });

    return await agentRequest(`/list-social-reports-tasks?${queryParams.toString()}`, 'GET');
}

export async function deleteSocialReportsTask(params: DeleteSocialReportsTaskParams) {
    const queryParams = new URLSearchParams({
        client_id: params.client_id,
        brand_id: params.brand_id,
    });

    return await agentRequest(`/delete-social-reports-task/${params.task_id}?${queryParams.toString()}`, 'DELETE');
}
