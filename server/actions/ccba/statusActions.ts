'use server';

import { authRequest } from '@/server/api/authRequest';
import { getCurrentUser } from '../authActions';
import { CcbaStatusResponse } from '@/types/status';
import { brandRequest } from '@/server/api/brandRequest';

export async function getCcbaTaskStatus(brandId: string): Promise<CcbaStatusResponse | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not found');
    }

    const response = await brandRequest(
      `/stage/running-tasks?stage=ccba&client_id=${user.client_id}&brand_id=${brandId}`,'GET'
    );

    return response;
  } catch (error) {
    console.error('Error in getCcbaTaskStatus:', error);
    return null;
  }
}
