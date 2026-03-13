import axios from 'axios';

async function test() {
  try {
    const res = await axios.options('https://api.telegram.org/bot8585527211:AAFe2LSDTn_EnKqwCKiBt9f_CKi1VJJttOQ/sendDocument', {
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'POST'
      }
    });
    console.log('CORS Headers:', res.headers);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

test();
