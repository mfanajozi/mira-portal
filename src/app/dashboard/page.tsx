'use client';

import React, { useState, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { MessagesTab } from '@/components/MessagesTab';
import { AudioTab } from '@/components/AudioTab';
import { ImagesTab } from '@/components/ImagesTab';
import { Message, Audio, Image } from '@/lib/database';

type TabType = 'messages' | 'audio' | 'images';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('messages');
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalAudio: 0,
    totalImages: 0,
    openQueries: 0,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [audio, setAudio] = useState<Audio[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, messagesRes, audioRes, imagesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/messages'),
        fetch('/api/audio'),
        fetch('/api/images'),
      ]);

      if (!statsRes.ok || !messagesRes.ok || !audioRes.ok || !imagesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [statsData, messagesData, audioData, imagesData] = await Promise.all([
        statsRes.json(),
        messagesRes.json(),
        audioRes.json(),
        imagesRes.json(),
      ]);

      setStats(statsData);
      setMessages(messagesData);
      setAudio(audioData);
      setImages(imagesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setStats({
        totalMessages: 0,
        totalAudio: 0,
        totalImages: 0,
        openQueries: 0,
      });
      setMessages([]);
      setAudio([]);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (endpoint: string, id: string, status: string, notes: string) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await loadData();
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs = [
    { id: 'messages' as TabType, label: 'Messages', count: messages.length },
    { id: 'audio' as TabType, label: 'Audio', count: audio.length },
    { id: 'images' as TabType, label: 'Images', count: images.length },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's an overview of your incident reports and management dashboard.
            </p>
          </div>
          <SignOutButton>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
              Logout
            </button>
          </SignOutButton>
        </div>

        <StatsOverview stats={stats} />

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'messages' && (
              <MessagesTab 
                messages={messages} 
                onStatusUpdate={(id, status, notes) => handleStatusUpdate('messages', id, status, notes)} 
              />
            )}
            {activeTab === 'audio' && (
              <AudioTab 
                audio={audio} 
                onStatusUpdate={(id, status, notes) => handleStatusUpdate('audio', id, status, notes)} 
              />
            )}
            {activeTab === 'images' && (
              <ImagesTab 
                images={images} 
                onStatusUpdate={(id, status, notes) => handleStatusUpdate('images', id, status, notes)} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
