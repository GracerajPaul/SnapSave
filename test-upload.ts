import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function test() {
  const formData = new FormData();
  formData.append('document', Buffer.from('test file content'), {
    filename: 'test.txt',
    contentType: 'text/plain'
  });

  try {
    const res = await axios.post('http://localhost:3000/api/vault/upload', formData, {
      headers: formData.getHeaders()
    });
    console.log('Success:', res.data);
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
