const axios = require('axios');

const API_URL = 'https://api-library-kohi-production.up.railway.app/api/lyrics';

module.exports = {
  name: 'lyrics',
  description: 'Searches and Fetches Song Lyrics.',
  usage: '-lyrics [song name]',
  author: 'kohi',

  async execute(senderId, args, token, event, sendMessage) {
    const query = args.join(' ').trim();
    if (!query) return sendMessage(senderId, { text: '❌ Please provide a song name.' }, token);

    try {
      const { data } = await axios.get(API_URL, {
        params: { query },
        timeout: 15000
      });

      if (!data?.status || !data.data?.lyrics) {
        return sendMessage(senderId, { text: '⚠️ No lyrics found.' }, token);
      }

      const { title, artist, lyrics } = data.data;

      await sendMessage(senderId, {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: `🎧 • ${title}`,
              subtitle: `By ${artist ?? 'Unknown'}`
            }]
          }
        }
      }, token);

      const chunks = lyrics.match(/.{1,1900}/gs) ?? [];
      for (const part of chunks) {
        await sendMessage(senderId, { text: part.trim() }, token);
      }

    } catch (err) {
      const reason = err.response
        ? `API error ${err.response.status}`
        : err.message ?? 'Unknown error';

      console.error(`[lyrics] Failed for sender ${senderId}: ${reason}`);
      await sendMessage(senderId, { text: '❎ Failed to fetch lyrics. Try again later.' }, token);
    }
  }
};