import needle from 'needle';
import { API_KEY, CREATOR } from '../../../settings';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;

    const apiKey = req.headers['api_key'];
    if (!apiKey || !API_KEY.includes(apiKey)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const result = await prodia(text);
      res.status(200).json({status: true, creator: CREATOR, data: result});
    } catch (error) {
      res.status(500).json({status: false, creator: CREATOR, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({status: false, creator: CREATOR, error: 'Method Not Allowed' });
  }
}

async function prodia(text) {
  try {
    const response = await axios.get('https://api.prodia.com/generate', {
      params: {
        new: true,
        prompt: text,
        model: 'absolutereality_v181.safetensors [3d9d4d2b]',
        negative_prompt: '',
        steps: 20,
        cfg: 7,
        seed: 1736383137,
        sampler: 'DPM++ 2M Karras',
        aspect_ratio: 'square'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://app.prodia.com/'
      }
    });

    if (response.status === 200) {
      const data = response.data;
      const jobId = data.job;
      const imageUrl = `https://images.prodia.xyz/${jobId}.png`;
      return {
        status: true,
        imageUrl: imageUrl
      };
    } else {
      return {
        status: false,
        message: 'Permintaan tidak dapat diproses'
      };
    }
  } catch (error) {
    if (error.response) {
      return {
        status: false,
        message: `Error: ${error.response.status} - ${error.response.statusText}`
      };
    } else if (error.request) {
      return {
        status: false,
        message: 'No response from the server.'
      };
    } else {
      return {
        status: false,
        message: error.message
      };
    }
  }
}