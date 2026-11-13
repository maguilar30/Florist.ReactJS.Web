import { apiRequest } from './client'
import type { LoyaltyMe, LoyaltyMember, LoyaltyReward, LoyaltyRewardUpsert } from '../types'

export async function fetchMyLoyalty(): Promise<LoyaltyMe> {
  return apiRequest<LoyaltyMe>('/loyalty/me')
}

export async function fetchAccountLoyalty(userId: string): Promise<LoyaltyMe> {
  return apiRequest<LoyaltyMe>(`/loyalty/accounts/${userId}`)
}

export async function fetchLoyaltyMembers(): Promise<LoyaltyMember[]> {
  return apiRequest<LoyaltyMember[]>('/loyalty/members')
}

export async function fetchLoyaltyRewards(): Promise<LoyaltyReward[]> {
  return apiRequest<LoyaltyReward[]>('/loyalty/rewards')
}

export async function createLoyaltyReward(payload: LoyaltyRewardUpsert): Promise<LoyaltyReward> {
  return apiRequest<LoyaltyReward>('/loyalty/rewards', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateLoyaltyReward(id: number, payload: LoyaltyRewardUpsert): Promise<LoyaltyReward> {
  return apiRequest<LoyaltyReward>(`/loyalty/rewards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteLoyaltyReward(id: number): Promise<void> {
  await apiRequest<void>(`/loyalty/rewards/${id}`, { method: 'DELETE' })
}
