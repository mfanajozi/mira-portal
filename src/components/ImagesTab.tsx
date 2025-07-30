import React, { useState } from 'react';
import { Image as ImageType } from '@/lib/database';
import { StatusBadge } from './StatusBadge';
import { StatusUpdateModal } from './StatusUpdateModal';
import { MapPin, Calendar, Edit3, Image } from 'lucide-react';

interface ImagesTabProps {
  images: ImageType[];
  onStatusUpdate: (id: string, status: string, notes: string) => Promise<void>;
}

export const ImagesTab: React.FC<ImagesTabProps> = ({ images, onStatusUpdate }) => {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: string, notes: string) => {
    if (!selectedImage) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(selectedImage.id, status, notes);
      setIsModalOpen(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {images.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No image reports found</p>
        </div>
      ) : (
        images.map((imageItem) => (
          <div
            key={imageItem.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Image className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Image Report</span>
                </div>
                
                <div className="mb-3">
                  <img
                    src={imageItem.image_url}
                    alt="Report"
                    className="max-w-full h-48 object-cover rounded-lg border"
                  />
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {imageItem.address && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{imageItem.address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(imageItem.date_reported).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status={imageItem.status} />
                <button
                  onClick={() => {
                    setSelectedImage(imageItem);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Update status"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {imageItem.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Notes:</span> {imageItem.notes}
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
          setSelectedImage(null);
        }}
        currentStatus={selectedImage?.status || 'NEW'}
        onUpdate={handleStatusUpdate}
        isLoading={isUpdating}
      />
    </div>
  );
};