
import { TG_BOT_TOKEN, TG_CHAT_ID } from '../constants.tsx';

/**
 * Service to handle asset interaction with Telegram.
 * SnapSave uses Telegram as an encrypted, distributed storage layer.
 */
export const TelegramService = {
  /**
   * Uploads any file to a Telegram chat via the Bot API.
   * Uses sendDocument to ensure original quality is preserved.
   */
  async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<{ file_id: string }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('chat_id', TG_CHAT_ID);
      formData.append('document', file);

      const xhr = new XMLHttpRequest();
      // Increase timeout for large video files
      xhr.timeout = 300000; // 5 minutes
      
      xhr.open('POST', `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendDocument`, true);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.ok) {
              const res = data.result;
              // Robust file_id extraction: Telegram might categorize the result even if sent via sendDocument
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
              reject(new Error(data.description || 'Telegram upload refused.'));
            }
          } catch (e) {
            reject(new Error('Malformed response from Telegram uplink.'));
          }
        } else {
          reject(new Error(`Uplink Error: ${xhr.status} - ${xhr.statusText}`));
        }
      };

      xhr.ontimeout = () => reject(new Error('Uplink timed out. The file might be too large or your connection is unstable.'));
      xhr.onerror = () => reject(new Error('Network connection interrupted during asset injection.'));
      
      xhr.send(formData);
    });
  },

  /**
   * Resolves a Telegram file_id to a temporary download URL.
   * Telegram file paths are short-lived, so we fetch them on-demand.
   */
  async getImageUrl(fileId: string): Promise<string> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getFile?file_id=${fileId}`);
      const data = await response.json();
      
      if (data.ok) {
        const filePath = data.result.file_path;
        return `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${filePath}`;
      }
      return '';
    } catch (error) {
      console.error('Failed to resolve Telegram asset path:', error);
      return '';
    }
  }
};
