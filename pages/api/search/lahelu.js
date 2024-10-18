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
      const result = await laheluSearch(text);
      res.status(200).json({status: true, creator: CREATOR, data: result});
    } catch (error) {
      res.status(500).json({status: false, creator: CREATOR, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({status: false, creator: CREATOR, error: 'Method Not Allowed' });
  }
}

const formatPostInfo = (postInfo) => ({
    ...postInfo,
    postID: `https://lahelu.com/post/${postInfo.postID}`,
    media: `https://cache.lahelu.com/${postInfo.media}`,
    mediaThumbnail: postInfo.mediaThumbnail == null ? null : `https://cache.lahelu.com/${postInfo.mediaThumbnail}`,
    userUsername: `https://lahelu.com/user/${postInfo.userUsername}`,
    userAvatar: `https://cache.lahelu.com/${postInfo.userAvatar}`,
    createTime: new Date(postInfo.createTime).toISOString()
});

const laheluSearch = async (query) => {
    const encodedQuery = encodeURIComponent(query);
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://lahelu.com',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'application/json, text/plain, */*',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'DNT': '1',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'TE': 'Trailers',
            'Host': 'lahelu.com',
            'Origin': 'https://lahelu.com',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    const response = await needle('get', `https://lahelu.com/api/post/get-search?query=${encodedQuery}`, options);

    if (response.statusCode === 200) {
        return response.body.postInfos.map(formatPostInfo);
    } else {
        throw new Error(`Request failed with status code ${response.statusCode}`);
    }
};
