import { useRef, useState, useCallback } from 'react';

export interface MediaCapture {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<Blob>;
  startVideoRecording: () => Promise<void>;
  stopVideoRecording: () => Promise<Blob>;
  startAudioRecording: () => Promise<void>;
  stopAudioRecording: () => Promise<Blob>;
  isRecording: boolean;
  isAudioRecording: boolean;
  stream: MediaStream | null;
  error: string | null;
}

export const useMediaCapture = (): MediaCapture => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      setStream(mediaStream);
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera access error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(async (): Promise<Blob> => {
    if (!stream) {
      throw new Error('Camera not started');
    }

    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create photo blob'));
          }
        }, 'image/jpeg', 0.9);
      };
    });
  }, [stream]);

  const startVideoRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      setStream(mediaStream);

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); 
      setIsRecording(true);
    } catch (err) {
      setError('Failed to start video recording. Please check permissions.');
      console.error('Video recording error:', err);
    }
  }, []);

  const stopVideoRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        reject(new Error('No recording in progress'));
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        resolve(blob);
        setIsRecording(false);
        stopCamera();
      };

      mediaRecorderRef.current.stop();
    });
  }, [isRecording, stopCamera]);

  const startAudioRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm'
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      setIsAudioRecording(true);
    } catch (err) {
      setError('Failed to start audio recording. Please check permissions.');
      console.error('Audio recording error:', err);
    }
  }, []);

  const stopAudioRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isAudioRecording) {
        reject(new Error('No audio recording in progress'));
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        resolve(blob);
        setIsAudioRecording(false);
      };

      mediaRecorderRef.current.stop();
    });
  }, [isAudioRecording]);

  return {
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
  };
};
