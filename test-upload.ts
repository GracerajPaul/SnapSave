import axios from 'axios';
import FormData from 'form-data';

async function test() {
  try {
    const TG_BOT_TOKEN = "8585527211:AAFe2LSDTn_EnKqwCKiBt9f_CKi1VJJttOQ";
    const TG_CHAT_ID = "7303640347";
    const formData = new FormData();
    formData.append('chat_id', TG_CHAT_ID);
    formData.append('document', Buffer.from('test file content'), { filename: 'test.txt' });

    const res = await axios.post(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendDocument`, formData, {
      headers: formData.getHeaders()
    });
    console.log('Upload success:', res.data.ok);
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
