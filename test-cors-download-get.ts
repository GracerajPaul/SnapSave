import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('https://api.telegram.org/bot8585527211:AAFe2LSDTn_EnKqwCKiBt9f_CKi1VJJttOQ/getFile?file_id=BQACAgUAAxkDAAM-abPWeya8EIVNgia5s7EFEwcAAcj5AAJMIAACDVeZVRz_hDxN7tK7OgQ');
    const filePath = res.data.result.file_path;
    console.log('File path:', filePath);
    
    const res2 = await axios.get(`https://api.telegram.org/file/bot8585527211:AAFe2LSDTn_EnKqwCKiBt9f_CKi1VJJttOQ/${filePath}`, {
      headers: {
        'Origin': 'https://example.com'
      }
    });
    console.log('Download GET CORS Headers:', res2.headers);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

test();
