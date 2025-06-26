import React from 'react';
import { XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';

interface MediaPreviewProps {
  file: File;
  type: 'image' | 'video' | 'audio';
  onRemove: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ file, type, onRemove }) => {
  const fileUrl = URL.createObjectURL(file);

  React.useEffect(() => {
    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  return (
    <div className="relative border-2 border-green-200 bg-green-50 rounded-lg overflow-hidden">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>

      {type === 'image' && (
        <div className="relative">
          <img
            src={fileUrl}
            alt="Captured photo"
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      )}

      {type === 'video' && (
        <div className="relative">
          <video
            src={fileUrl}
            className="w-full h-48 object-cover"
            controls
            preload="metadata"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      )}

      {type === 'audio' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <audio
            src={fileUrl}
            controls
            className="w-full"
          />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      )}
    </div>
  );
};
