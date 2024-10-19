import axios from 'axios';
import qs from 'qs';
import { API_KEY, CREATOR } from '../../../settings';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;

    const apiKey = req.headers['api_key'];
    if (!apiKey || !API_KEY.includes(apiKey)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const result = await postData(text);
      res.status(200).json({status: true, creator: CREATOR, data: result});
    } catch (error) {
      res.status(500).json({status: false, creator: CREATOR, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({status: false, creator: CREATOR, error: 'Method Not Allowed' });
  }
}

async function getSearchResults(query) {
  const url = 'https://aoyo.ai/Api/AISearch/Source';
  const requestData = {
    q: query,
    num: 20,
    hl: 'id-ID'
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json, text/plain, */*'
  };

  const response = await axios.post(url, qs.stringify(requestData), { headers });
  return response.data.organic;
}

async function postData(content) {
  const searchQuery = content;
  const searchResults = await getSearchResults(searchQuery);

  const engineContent = searchResults.map((result, index) => ({
    title: result.title,
    link: result.link,
    snippet: result.snippet,
    sitelinks: result.sitelinks ? result.sitelinks.map(link => ({
      title: link.title,
      link: link.link
    })) : [],
    position: index + 1
  }));

  const url = 'https://aoyo.ai/Api/AISearch/AISearch';
  const requestData = {
    content: content,
    id: generateRandomString(32),
    language: 'id-ID',
    engineContent: JSON.stringify(engineContent),
    randomNumber: generateRandomNumberString(17)
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
    'Referer': 'https://aoyo.ai/search/?q=' + encodeURIComponent(content)
  };

  const response = await axios.post(url, qs.stringify(requestData), { headers });
  return response.data.replace(/\[START\][\s\S]*$/g, '').trim();
}

function generateRandomString(length) {
  const characters = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateRandomNumberString(length) {
  const characters = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
