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
      const result = await idn(text);
      res.status(200).json({status: true, creator: CREATOR, data: result});
    } catch (error) {
      res.status(500).json({status: false, creator: CREATOR, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({status: false, creator: CREATOR, error: 'Method Not Allowed' });
  }
}

async function idn(avosky, m) {
    const url = `https://www.idntimes.com/search?keyword=${encodeURIComponent(avosky)}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const result = [];

        $('li.box-latest.box-list').each((i, element) => {
            const title = $(element).find('h2.title-text').text().trim();
            const category = $(element).find('.category').text().trim();
            const date = $(element).find('.date').text().trim();
            const articleUrl = $(element).find('a').attr('href');
            const imageUrl = $(element).find('img').attr('src') || $(element).find('img').attr('data-src');

            if (title && category && date && articleUrl && imageUrl) {
                result.push({
                    title,
                    category,
                    date,
                    articleUrl,
                    imageUrl
                });
            }
        });

        if (result.length > 0) {
            let message = `Hasil pencarian untuk: *${avosky}*\n\n`;

            result.forEach((item, index) => {
                message += `${index + 1}. *${item.title}*\n`;
                message += `Kategori: ${item.category}\n`;
                message += `Tanggal: ${item.date}\n`;
                message += `Link: ${item.articleUrl}\n`;
                message += `Gambar: ${item.imageUrl}\n\n`;
            });

            console.log(message);
        } else {
            console.log('Tidak ada hasil.');
        }
    } catch (error) {
        console.log('Error.');
    }
}