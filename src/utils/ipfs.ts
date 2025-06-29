export async function uploadToIPFS(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData,
  });

  if (!res.ok) throw new Error('Erreur upload Pinata: ' + (await res.text()));
  const data = await res.json();
  return data.IpfsHash;
}

export const uploadTextToIPFS = async (text: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const file = new File([text], 'text.txt', { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Erreur upload Pinata: ' + (await res.text()));
  const data = await res.json();
  return data.IpfsHash;
};

export const getIPFSUrl = (hash: string): string => {
  return `https://ipfs.io/ipfs/${hash}`;
};
