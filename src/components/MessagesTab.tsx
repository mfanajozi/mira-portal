import React, { useState } from 'react';
import { Message } from '@/lib/database';
import { StatusBadge } from './StatusBadge';
import { StatusUpdateModal } from './StatusUpdateModal';
import { MapPin, Calendar, Edit3 } from 'lucide-react';

interface MessagesTabProps {
  messages: Message[];
  onStatusUpdate: (id: string, status: string, notes: string) => Promise<void>;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({ messages, onStatusUpdate }) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: string, notes: string) => {
    if (!selectedMessage) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(selectedMessage.id, status, notes);
      setIsModalOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No messages found</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <p className="text-gray-900 mb-2 leading-relaxed">{message.message}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {message.address && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{message.address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(message.date_reported).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status={message.status} />
                <button
                  onClick={() => {
                    setSelectedMessage(message);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Update status"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {message.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Notes:</span> {message.notes}
                </p>
              </div>
            )}
          </div>
        ))
      )}

      <StatusUpdateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMessage(null);
        }}
        currentStatus={selectedMessage?.status || 'NEW'}
        onUpdate={handleStatusUpdate}
        isLoading={isUpdating}
      />
    </div>
  );
};