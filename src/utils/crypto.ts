import CryptoJS from 'crypto-js';

export const generateSHA256 = (data: string | ArrayBuffer): string => {
  if (data instanceof ArrayBuffer) {
    const wordArray = CryptoJS.lib.WordArray.create(data);
    return CryptoJS.SHA256(wordArray).toString();
  }
  return CryptoJS.SHA256(data).toString();
};

export const generateFileHash = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const hash = generateSHA256(e.target.result as ArrayBuffer);
        resolve(hash);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const hashLocation = (latitude: number, longitude: number): string => {
  const locationString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  return generateSHA256(locationString);
};
