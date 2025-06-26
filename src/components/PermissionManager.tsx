import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { 
  CameraIcon, 
  MicrophoneIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

interface PermissionRequest {
  camera?: boolean;
  microphone?: boolean;
}

interface PermissionStatus {
  camera: PermissionState | 'unknown';
  microphone: PermissionState | 'unknown';
}

interface PermissionManagerProps {
  requiredPermissions: PermissionRequest;
  onPermissionsGranted: () => void;
  onPermissionsDenied: (deniedPermissions: string[]) => void;
  children?: React.ReactNode;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  requiredPermissions,
  onPermissionsGranted,
  onPermissionsDenied,
  children
}) => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    camera: 'unknown',
    microphone: 'unknown'
  });
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState(false);

  const checkPermissions = React.useCallback(async () => {
    setIsCheckingPermissions(true);
    const status: PermissionStatus = {
      camera: 'unknown',
      microphone: 'unknown'
    };

    try {
      if (requiredPermissions.camera) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          status.camera = result.state;
        } catch {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            status.camera = 'granted';
          } catch {
            status.camera = 'denied';
          }
        }
      }

      if (requiredPermissions.microphone) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          status.microphone = result.state;
        } catch {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            status.microphone = 'granted';
          } catch {
            status.microphone = 'denied';
          }
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }

    setPermissionStatus(status);
    setPermissionsChecked(true);
    setIsCheckingPermissions(false);

    const deniedPermissions: string[] = [];
    if (requiredPermissions.camera && status.camera !== 'granted') {
      deniedPermissions.push('camera');
    }
    if (requiredPermissions.microphone && status.microphone !== 'granted') {
      deniedPermissions.push('microphone');
    }

    if (deniedPermissions.length === 0) {
      onPermissionsGranted();
    } else {
      onPermissionsDenied(deniedPermissions);
    }
  }, [requiredPermissions.camera, requiredPermissions.microphone, onPermissionsGranted, onPermissionsDenied]);

  const requestPermissions = async () => {
    setIsCheckingPermissions(true);
    
    try {
      const constraints: MediaStreamConstraints = {};
      
      if (requiredPermissions.camera) {
        constraints.video = true;
      }
      if (requiredPermissions.microphone) {
        constraints.audio = true;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      stream.getTracks().forEach(track => track.stop());
      
      await checkPermissions();
    } catch (error) {
      console.error('Permission request failed:', error);
      await checkPermissions();
    }
  };

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const getPermissionIcon = (permission: PermissionState | 'unknown') => {
    switch (permission) {
      case 'granted':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'prompt':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPermissionText = (permission: PermissionState | 'unknown') => {
    switch (permission) {
      case 'granted':
        return 'Accordé';
      case 'denied':
        return 'Refusé';
      case 'prompt':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  const allPermissionsGranted = 
    (!requiredPermissions.camera || permissionStatus.camera === 'granted') &&
    (!requiredPermissions.microphone || permissionStatus.microphone === 'granted');

  if (!permissionsChecked) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Vérification des permissions...</span>
      </div>
    );
  }

  if (allPermissionsGranted) {
    return <>{children}</>;
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="text-center mb-6">
        <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Permissions requises
        </h3>
        <p className="text-gray-600">
          Cette fonctionnalité nécessite l'accès aux périphériques suivants :
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {requiredPermissions.camera && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <CameraIcon className="w-6 h-6 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Caméra</p>
                <p className="text-sm text-gray-600">Pour prendre des photos et enregistrer des vidéos</p>
              </div>
            </div>
            <div className="flex items-center">
              {getPermissionIcon(permissionStatus.camera)}
              <span className="ml-2 text-sm text-gray-600">
                {getPermissionText(permissionStatus.camera)}
              </span>
            </div>
          </div>
        )}

        {requiredPermissions.microphone && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <MicrophoneIcon className="w-6 h-6 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Microphone</p>
                <p className="text-sm text-gray-600">Pour enregistrer du contenu audio</p>
              </div>
            </div>
            <div className="flex items-center">
              {getPermissionIcon(permissionStatus.microphone)}
              <span className="ml-2 text-sm text-gray-600">
                {getPermissionText(permissionStatus.microphone)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <Button
          onClick={requestPermissions}
          disabled={isCheckingPermissions}
          isLoading={isCheckingPermissions}
          className="mb-3"
        >
          {isCheckingPermissions ? 'Demande en cours...' : 'Autoriser l\'accès'}
        </Button>
        
        <div className="text-sm text-gray-500">
          <p className="mb-2">
            <strong>Pourquoi ces permissions sont-elles nécessaires ?</strong>
          </p>
          <ul className="text-left space-y-1">
            {requiredPermissions.camera && (
              <li>• La caméra permet de capturer des preuves visuelles en temps réel</li>
            )}
            {requiredPermissions.microphone && (
              <li>• Le microphone permet d'enregistrer des preuves audio</li>
            )}
            <li>• Vos données restent privées et sont chiffrées</li>
            <li>• Vous pouvez révoquer ces permissions à tout moment</li>
          </ul>
        </div>
      </div>

      {(permissionStatus.camera === 'denied' || permissionStatus.microphone === 'denied') && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <XCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">
                Permissions refusées
              </h4>
              <p className="text-sm text-red-700 mt-1">
                Pour utiliser cette fonctionnalité, vous devez autoriser l'accès dans les paramètres de votre navigateur :
              </p>
              <ol className="text-sm text-red-700 mt-2 list-decimal list-inside">
                <li>Cliquez sur l'icône de cadenas dans la barre d'adresse</li>
                <li>Autorisez l'accès à la caméra et/ou au microphone</li>
                <li>Rechargez la page</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManager;
