import axios from 'axios';

async function test() {
  try {
    const res = await axios.options('https://api.telegram.org/file/bot8585527211:AAFe2LSDTn_EnKqwCKiBt9f_CKi1VJJttOQ/documents/file_0.txt', {
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log('Download CORS Headers:', res.headers);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

test();
