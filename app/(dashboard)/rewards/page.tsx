// app/(dashboard)/rewards/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';

const mockRewards = [
  {
    id: '1',
    name: 'VIP Role',
    description: 'Get the VIP role in the community',
    type: 'role',
    requiredLevel: 10,
    isActive: true,
    claims: 23
  },
  {
    id: '2',
    name: '7 Days Free',
    description: 'Extend your membership by 7 days',
    type: 'free_days',
    requiredLevel: 15,
    isActive: true,
    claims: 12
  },
  {
    id: '3',
    name: '20% Discount Code',
    description: 'Get a 20% discount on your next purchase',
    type: 'discount_code',
    requiredLevel: 20,
    isActive: true,
    claims: 8
  },
  {
    id: '4',
    name: 'Elite Member',
    description: 'Unlock exclusive content and channels',
    type: 'role',
    requiredLevel: 25,
    isActive: true,
    claims: 5
  },
];

const rewardTypeLabels: Record<string, string> = {
  role: 'Role Assignment',
  free_days: 'Free Days',
  discount_code: 'Discount Code',
  custom: 'Custom Reward'
};

const rewardTypeColors: Record<string, string> = {
  role: 'bg-purple-100 text-purple-800',
  free_days: 'bg-green-100 text-green-800',
  discount_code: 'bg-blue-100 text-blue-800',
  custom: 'bg-gray-100 text-gray-800'
};

export default function RewardsPage() {
  const [rewards] = useState(mockRewards);

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage rewards that members can claim with XP and levels
          </p>
        </div>
        <Link
          href="/rewards/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Create Reward
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {reward.name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    reward.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {reward.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {reward.description}
                </p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  rewardTypeColors[reward.type]
                }`}>
                  {rewardTypeLabels[reward.type]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Required Level</p>
                <p className="text-lg font-semibold text-gray-900">
                  Level {reward.requiredLevel}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Claims</p>
                <p className="text-lg font-semibold text-gray-900">
                  {reward.claims}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reward Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Rewards</p>
            <p className="text-2xl font-bold text-gray-900">{rewards.length}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Active Rewards</p>
            <p className="text-2xl font-bold text-gray-900">
              {rewards.filter(r => r.isActive).length}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Claims</p>
            <p className="text-2xl font-bold text-gray-900">
              {rewards.reduce((sum, r) => sum + r.claims, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
