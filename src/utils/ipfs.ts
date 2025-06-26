export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    console.log('Uploading to IPFS:', file.name);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  } catch (error) {
    console.error('IPFS upload failed:', error);
    throw new Error('Failed to upload to IPFS');
  }
};

export const uploadTextToIPFS = async (text: string): Promise<string> => {
  try {
    console.log('Uploading text to IPFS:', text.length, 'characters');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  } catch (error) {
    console.error('IPFS text upload failed:', error);
    throw new Error('Failed to upload text to IPFS');
  }
};

export const getIPFSUrl = (hash: string): string => {
  return `https://ipfs.io/ipfs/${hash}`;
};
