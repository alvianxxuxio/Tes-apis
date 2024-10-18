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
      const result = await txt2img(text);
      res.status(200).json({status: true, creator: CREATOR, data: result});
    } catch (error) {
      res.status(500).json({status: false, creator: CREATOR, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({status: false, creator: CREATOR, error: 'Method Not Allowed' });
  }
}

async function txt2img(prompt) {
    const Api = "https://ai-api.magicstudio.com/api/ai-art-generator";
    const body = `prompt=${encodeURIComponent(prompt)}`;
    try {
        const respons = await fetch(Api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });
        if (respons.ok) {
            const imageBuffer = await respons.buffer();
            return imageBuffer
        } else {
            const responsError = await respons.text();
            throw new Error(`Error get this image. Status code: ${respons.status}, Error: ${responsError}`);
        }
    } catch (error) {
        throw error
    }
}
async function text2imgAfter(prompt) {
    try {
        const imageBuffer = await txt2img(prompt);
        const Url = await uploadFile(imageBuffer, 'generated_image.png');
        return Url
    } catch (error) {
        throw error
    }
}