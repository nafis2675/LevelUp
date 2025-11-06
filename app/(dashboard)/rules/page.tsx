// app/(dashboard)/rules/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';

const mockRules = [
  {
    id: '1',
    name: 'Send Message',
    eventType: 'message.created',
    xpAmount: 5,
    cooldown: 60,
    maxPerDay: 100,
    isActive: true
  },
  {
    id: '2',
    name: 'Make Purchase',
    eventType: 'purchase.completed',
    xpAmount: 100,
    cooldown: 0,
    maxPerDay: 0,
    isActive: true
  },
  {
    id: '3',
    name: 'Join Community',
    eventType: 'member.joined',
    xpAmount: 50,
    cooldown: 0,
    maxPerDay: 1,
    isActive: true
  },
  {
    id: '4',
    name: 'Complete Course Section',
    eventType: 'course.completed',
    xpAmount: 150,
    cooldown: 0,
    maxPerDay: 0,
    isActive: true
  },
];

const eventTypeLabels: Record<string, string> = {
  'message.created': 'Message Sent',
  'purchase.completed': 'Purchase Made',
  'member.joined': 'Member Joined',
  'course.completed': 'Course Completed'
};

export default function RulesPage() {
  const [rules] = useState(mockRules);

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">XP Rules</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure how members earn XP in your community
          </p>
        </div>
        <Link
          href="/rules/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Create Rule
        </Link>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {rule.name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rule.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Trigger: {eventTypeLabels[rule.eventType] || rule.eventType}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">
                  +{rule.xpAmount} XP
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Cooldown</p>
                <p className="font-semibold text-gray-900">
                  {rule.cooldown > 0 ? `${rule.cooldown}s` : 'None'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Per Day</p>
                <p className="font-semibold text-gray-900">
                  {rule.maxPerDay > 0 ? rule.maxPerDay : 'Unlimited'}
                </p>
              </div>
              <div className="text-right">
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rule Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Rules</p>
            <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Active Rules</p>
            <p className="text-2xl font-bold text-gray-900">
              {rules.filter(r => r.isActive).length}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">XP Granted Today</p>
            <p className="text-2xl font-bold text-gray-900">12,450</p>
          </div>
        </div>
      </div>
    </div>
  );
}
