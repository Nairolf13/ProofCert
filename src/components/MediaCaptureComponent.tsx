import React, { useRef, useEffect, useState } from 'react';
import { Button } from './Button';
import { PermissionManager } from './PermissionManager';
import { PermissionNotice } from './PermissionNotice';
import { useMediaCapture } from '../hooks/useMediaCapture';
import { 
  VideoCameraIcon, 
  MicrophoneIcon,
  StopIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MediaCaptureComponentProps {
  onCapture: (file: File, type: 'image' | 'video' | 'audio') => void;
  onClose: () => void;
  mode: 'photo' | 'video' | 'audio';
}

export const MediaCaptureComponent: React.FC<MediaCaptureComponentProps> = ({
  onCapture,
  onClose,
  mode
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showPermissionNotice, setShowPermissionNotice] = useState(true);
  
  const {
    startCamera,
    stopCamera,
    capturePhoto,
    startVideoRecording,
    stopVideoRecording,
    startAudioRecording,
    stopAudioRecording,
    isRecording,
    isAudioRecording,
    stream,
    error
  } = useMediaCapture();

  useEffect(() => {
    if (permissionsGranted && (mode === 'photo' || mode === 'video')) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [mode, permissionsGranted, startCamera, stopCamera]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handlePermissionsGranted = () => {
    setPermissionsGranted(true);
    setShowPermissionNotice(false);
  };

  const handlePermissionsDenied = () => {
    setPermissionsGranted(false);
    setShowPermissionNotice(true);
  };

  const getRequiredPermissions = () => {
    switch (mode) {
      case 'photo':
        return { camera: true };
      case 'video':
        return { camera: true, microphone: true };
      case 'audio':
        return { microphone: true };
      default:
        return {};
    }
  };

    const getPermissionNoticeType = () => {
    switch (mode) {
      case 'photo':
        return 'camera' as const;
      case 'video':
        return 'camera-audio' as const;
      case 'audio':
        return 'microphone' as const;
      default:
        return 'camera' as const;
    }
  };

  const handleCapturePhoto = async () => {
    try {
      const photoBlob = await capturePhoto();
      const file = new File([photoBlob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file, 'image');
      onClose();
    } catch (err) {
      console.error('Photo capture failed:', err);
    }
  };

  const handleStartVideoRecording = async () => {
    try {
      await startVideoRecording();
    } catch (err) {
      console.error('Video recording start failed:', err);
    }
  };

  const handleStopVideoRecording = async () => {
    try {
      const videoBlob = await stopVideoRecording();
      const file = new File([videoBlob], `video-${Date.now()}.webm`, { type: 'video/webm' });
      onCapture(file, 'video');
      onClose();
    } catch (err) {
      console.error('Video recording stop failed:', err);
    }
  };

  const handleStartAudioRecording = async () => {
    try {
      await startAudioRecording();
    } catch (err) {
      console.error('Audio recording start failed:', err);
    }
  };

  const handleStopAudioRecording = async () => {
    try {
      const audioBlob = await stopAudioRecording();
      const file = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
      onCapture(file, 'audio');
      onClose();
    } catch (err) {
      console.error('Audio recording stop failed:', err);
    }
  };

  // Show permission notice first
  if (showPermissionNotice && !permissionsGranted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Media Access Required</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
          
          <PermissionNotice type={getPermissionNoticeType()} />
          
          <PermissionManager
            requiredPermissions={getRequiredPermissions()}
            onPermissionsGranted={handlePermissionsGranted}
            onPermissionsDenied={handlePermissionsDenied}
          />
          
          <div className="mt-4">
            <Button variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-600">Access Error</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Please:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Allow camera/microphone access when prompted</li>
              <li>Check browser settings for media permissions</li>
              <li>Ensure your device has a working camera/microphone</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setShowPermissionNotice(true);
                setPermissionsGranted(false);
              }}
              className="flex-1"
            >
              Try Again
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {mode === 'photo' && 'Take Photo'}
            {mode === 'video' && 'Record Video'}
            {mode === 'audio' && 'Record Audio'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative">
          {(mode === 'photo' || mode === 'video') && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-2xl h-auto bg-black"
              style={{ aspectRatio: '16/9' }}
            />
          )}

          {mode === 'audio' && (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                isAudioRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
              }`}>
                <MicrophoneIcon className={`w-12 h-12 ${
                  isAudioRecording ? 'text-red-600' : 'text-gray-600'
                }`} />
              </div>
              <p className="text-lg font-medium text-gray-800 mb-2">
                {isAudioRecording ? 'Recording...' : 'Ready to record'}
              </p>
              <p className="text-sm text-gray-600">
                {isAudioRecording ? 'Click stop when finished' : 'Click the microphone to start recording'}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 p-6 bg-gray-50">
          {mode === 'photo' && (
            <Button
              onClick={handleCapturePhoto}
              size="lg"
              leftIcon={<PhotoIcon className="w-6 h-6" />}
              disabled={!stream}
            >
              Take Photo
            </Button>
          )}

          {mode === 'video' && (
            <>
              {!isRecording ? (
                <Button
                  onClick={handleStartVideoRecording}
                  size="lg"
                  leftIcon={<VideoCameraIcon className="w-6 h-6" />}
                  disabled={!stream}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={handleStopVideoRecording}
                  size="lg"
                  leftIcon={<StopIcon className="w-6 h-6" />}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Stop Recording
                </Button>
              )}
            </>
          )}

          {mode === 'audio' && (
            <>
              {!isAudioRecording ? (
                <Button
                  onClick={handleStartAudioRecording}
                  size="lg"
                  leftIcon={<MicrophoneIcon className="w-6 h-6" />}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={handleStopAudioRecording}
                  size="lg"
                  leftIcon={<StopIcon className="w-6 h-6" />}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Stop Recording
                </Button>
              )}
            </>
          )}

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
