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
      const result = await halodoc(text);
      res.status(200).json({status: true, creator: CREATOR, data: result});
    } catch (error) {
      res.status(500).json({status: false, creator: CREATOR, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({status: false, creator: CREATOR, error: 'Method Not Allowed' });
  }
}

async function halodoc(query) {
  const url = `https://www.halodoc.com/artikel/search/${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const articles = $('magneto-card').map((index, element) => ({
      title: $(element).find('header a').text().trim(),
      articleLink: 'https://www.halodoc.com' + $(element).find('header a').attr('href'),
      imageSrc: $(element).find('magneto-image-mapper img').attr('src'),
      healthLink: 'https://www.halodoc.com' + $(element).find('.tag-container a').attr('href'),
      healthTitle: $(element).find('.tag-container a').text().trim(),
      description: $(element).find('.description').text().trim(),
    })).get();

    return articles;
  } catch (err) {
    console.error(err);
    return [];
  }
}