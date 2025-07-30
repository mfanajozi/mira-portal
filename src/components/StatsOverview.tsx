import React from 'react';
import { MessageSquare, Volume2, Image, AlertCircle } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalMessages: number;
    totalAudio: number;
    totalImages: number;
    openQueries: number;
  };
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const statItems = [
    {
      title: 'Messages (90 days)',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      title: 'Audio Reports (90 days)',
      value: stats.totalAudio,
      icon: Volume2,
      color: 'bg-green-500',
    },
    {
      title: 'Image Reports (90 days)',
      value: stats.totalImages,
      icon: Image,
      color: 'bg-purple-500',
    },
    {
      title: 'Open Queries',
      value: stats.openQueries,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className={`${item.color} rounded-lg p-3`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{item.title}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};