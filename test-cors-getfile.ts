import axios from 'axios';

async function test() {
  try {
    const res = await axios.options('https://api.telegram.org/bot8585527211:AAFe2LSDTn_EnKqwCKiBt9f_CKi1VJJttOQ/getFile?file_id=BQACAgUAAxkDAAM-abPWeya8EIVNgia5s7EFEwcAAcj5AAJMIAACDVeZVRz_hDxN7tK7OgQ', {
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log('getFile CORS Headers:', res.headers);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

test();
