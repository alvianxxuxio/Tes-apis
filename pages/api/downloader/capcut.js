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
      const result = await capcut(text);
      res.status(200).json({status: true, creator: CREATOR, data: result});
    } catch (error) {
      res.status(500).json({status: false, creator: CREATOR, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({status: false, creator: CREATOR, error: 'Method Not Allowed' });
  }
}

async function capcut(url) {
  const response = await fetch(url);
  const data = await response.text();
  const $ = cheerio.load(data);

  return {
    thumbnail: $("video").attr("poster"),
    video: $("video").attr("src"),
  };
}