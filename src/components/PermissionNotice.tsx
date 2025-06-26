import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface PermissionNoticeProps {
  type: 'camera' | 'microphone' | 'camera-audio';
}

export const PermissionNotice: React.FC<PermissionNoticeProps> = ({ type }) => {
  const getMessage = () => {
    switch (type) {
      case 'camera':
        return {
          title: 'Camera Access Required',
          description: 'To take photos, this app needs access to your camera. You\'ll be prompted to allow camera access.',
          permissions: ['Camera access for taking photos']
        };
      case 'microphone':
        return {
          title: 'Microphone Access Required',
          description: 'To record audio, this app needs access to your microphone. You\'ll be prompted to allow microphone access.',
          permissions: ['Microphone access for recording audio']
        };
      case 'camera-audio':
        return {
          title: 'Camera & Microphone Access Required',
          description: 'To record video with audio, this app needs access to your camera and microphone. You\'ll be prompted to allow both permissions.',
          permissions: ['Camera access for recording video', 'Microphone access for recording audio']
        };
    }
  };

  const { title, description, permissions } = getMessage();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-800 mb-1">{title}</h4>
          <p className="text-sm text-blue-700 mb-2">{description}</p>
          <ul className="text-xs text-blue-600 space-y-1">
            {permissions.map((permission, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                {permission}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
