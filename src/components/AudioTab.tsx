import React, { useState } from 'react';
import { Audio } from '@/lib/database';
import { StatusBadge } from './StatusBadge';
import { StatusUpdateModal } from './StatusUpdateModal';
import { MapPin, Calendar, Edit3, Volume2 } from 'lucide-react';

interface AudioTabProps {
  audio: Audio[];
  onStatusUpdate: (id: string, status: string, notes: string) => Promise<void>;
}

export const AudioTab: React.FC<AudioTabProps> = ({ audio, onStatusUpdate }) => {
  const [selectedAudio, setSelectedAudio] = useState<Audio | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: string, notes: string) => {
    if (!selectedAudio) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(selectedAudio.id, status, notes);
      setIsModalOpen(false);
      setSelectedAudio(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {audio.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No audio reports found</p>
        </div>
      ) : (
        audio.map((audioItem) => (
          <div
            key={audioItem.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Audio Report</span>
                </div>
                
                <audio controls className="w-full mb-3">
                  <source src={audioItem.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {audioItem.address && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{audioItem.address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(audioItem.date_reported).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status={audioItem.status} />
                <button
                  onClick={() => {
                    setSelectedAudio(audioItem);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Update status"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {audioItem.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Notes:</span> {audioItem.notes}
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
          setSelectedAudio(null);
        }}
        currentStatus={selectedAudio?.status || 'NEW'}
        onUpdate={handleStatusUpdate}
        isLoading={isUpdating}
      />
    </div>
  );
};