import React from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useUser();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-20 h-20 bg-white-600 rounded-lg">
              <img src="/mira.png" alt="MIRA Logo" className="w-30 h-22" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MIRA Portal</h1>
              <p className="text-xs text-gray-500">Management & Incident Reporting</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName || user?.firstName || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  );
};