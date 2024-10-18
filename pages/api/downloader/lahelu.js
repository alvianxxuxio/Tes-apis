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
      const result = await laheluDownloader(text);
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

const laheluDownloader = async (url) => {
	try {
		const response = await needle('get', url);
		const html = response.body;
		const json = html.match(/JSON.parse(.*?); /)[0];
		const { postInfo } = eval(json.replace('window.', ''));

		return formatPostInfo(postInfo);
	} catch (error) {
		console.error('Error:', error);
	}
};
