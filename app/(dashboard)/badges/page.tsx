// app/(dashboard)/badges/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';

const mockBadges = [
  {
    id: '1',
    name: 'Welcome',
    description: 'Join the community',
    imageUrl: '👋',
    rarity: 'common',
    requirement: { type: 'member_join' },
    isActive: true
  },
  {
    id: '2',
    name: 'Chatter',
    description: 'Send 100 messages',
    imageUrl: '💬',
    rarity: 'common',
    requirement: { type: 'message_count', value: 100 },
    isActive: true
  },
  {
    id: '3',
    name: 'Level 10',
    description: 'Reach level 10',
    imageUrl: '🔟',
    rarity: 'rare',
    requirement: { type: 'level', value: 10 },
    isActive: true
  },
  {
    id: '4',
    name: 'Early Adopter',
    description: 'One of the first 100 members',
    imageUrl: '🌟',
    rarity: 'epic',
    requirement: { type: 'custom' },
    isActive: true
  },
  {
    id: '5',
    name: 'Supporter',
    description: 'Make any purchase',
    imageUrl: '💎',
    rarity: 'rare',
    requirement: { type: 'purchase_count', value: 1 },
    isActive: true
  },
];

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-300',
  rare: 'bg-blue-100 text-blue-800 border-blue-300',
  epic: 'bg-purple-100 text-purple-800 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
};

export default function BadgesPage() {
  const [badges] = useState(mockBadges);

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Badges</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage achievement badges for your community
          </p>
        </div>
        <Link
          href="/badges/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Create Badge
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`bg-white rounded-lg shadow-md border-2 p-6 hover:shadow-lg transition ${
              rarityColors[badge.rarity as keyof typeof rarityColors]
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-6xl">{badge.imageUrl}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                rarityColors[badge.rarity as keyof typeof rarityColors]
              }`}>
                {badge.rarity}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {badge.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {badge.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                badge.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {badge.isActive ? 'Active' : 'Inactive'}
              </span>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Badge Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Badges</p>
            <p className="text-2xl font-bold text-gray-900">{badges.length}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Active Badges</p>
            <p className="text-2xl font-bold text-gray-900">
              {badges.filter(b => b.isActive).length}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Earned</p>
            <p className="text-2xl font-bold text-gray-900">423</p>
          </div>
        </div>
      </div>
    </div>
  );
}
