
const urlCache = new Map<string, string>();

/**
 * Service to handle asset interaction with Telegram.
 * SnapSave uses Telegram as an encrypted, distributed storage layer.
 */
export const TelegramService = {
  /**
   * Uploads any file to a Telegram chat via the backend proxy.
   */
  async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<{ file_id: string }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('document', file);

      const xhr = new XMLHttpRequest();
      xhr.timeout = 300000; // 5 minutes
      
      xhr.open('POST', '/api/vault/upload', true);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        let responseData: any = {};
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch (e) {
          responseData = { description: 'Malformed response from server.' };
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          if (responseData.ok) {
            const res = responseData.result;
            const fileId = (
              res.document?.file_id || 
              res.video?.file_id || 
              res.animation?.file_id || 
              res.audio?.file_id || 
              res.photo?.[res.photo.length - 1]?.file_id
            );
            
            if (fileId) {
              resolve({ file_id: fileId });
            } else {
              reject(new Error('Upload successful but file ID could not be extracted.'));
            }
          } else {
            reject(new Error(responseData.description || 'Telegram upload refused.'));
          }
        } else {
          const errorMsg = responseData.description || `Proxy Error: ${xhr.status}`;
          reject(new Error(errorMsg));
        }
      };

      xhr.ontimeout = () => reject(new Error('Uplink timed out.'));
      xhr.onerror = () => reject(new Error('Network connection interrupted.'));
      
      xhr.send(formData);
    });
  },

  /**
   * Resolves a Telegram file_id to a temporary download URL via proxy.
   */
  async getImageUrl(fileId: string): Promise<string> {
    if (!fileId) return '';
    if (urlCache.has(fileId)) return urlCache.get(fileId)!;
    
    try {
      const response = await fetch(`/api/vault/shard-info/${encodeURIComponent(fileId)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ description: 'Unknown error' }));
        console.error(`Server Error (${response.status}):`, errorData.description);
        return '';
      }

      const data = await response.json();
      
      if (data.ok) {
        const filePath = data.result.file_path;
        const downloadUrl = `/api/vault/shard-download?filePath=${encodeURIComponent(filePath)}`;
        urlCache.set(fileId, downloadUrl);
        return downloadUrl;
      }
      return '';
    } catch (error) {
      console.error(`Failed to resolve Telegram asset path for ${fileId}:`, error instanceof Error ? error.message : error);
      return '';
    }
  }
};
