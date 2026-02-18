
import { TG_BOT_TOKEN, TG_CHAT_ID } from '../constants.tsx';

/**
 * Service to handle image interaction with Telegram.
 * SnapSave uses Telegram as an encrypted, distributed storage layer.
 */
export const TelegramService = {
  /**
   * Uploads a file to a Telegram chat via the Bot API.
   * Returns metadata including the file_id.
   */
  async uploadImage(file: File, onProgress?: (percent: number) => void): Promise<{ file_id: string }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('chat_id', TG_CHAT_ID);
      formData.append('document', file);

      const xhr = new XMLHttpRequest();
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
              const fileId = data.result.document.file_id;
              resolve({ file_id: fileId });
            } else {
              reject(new Error(data.description || 'Telegram upload failed'));
            }
          } catch (e) {
            reject(new Error('Invalid response from Telegram server'));
          }
        } else {
          reject(new Error(`HTTP Error: ${xhr.status} - ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network connection error during Telegram upload'));
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
      console.error('Failed to resolve Telegram image path:', error);
      return '';
    }
  }
};
