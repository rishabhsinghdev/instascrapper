const axios = require('axios');
const { Telegraf } = require('telegraf');

const BOT_TOKEN = '6578601939:AAHeXFA7_4_ZPrQKTTl0bkf1C9Vz5frS-UQ';
const CHAT_ID = '2119695649';
const RAPID_API_KEY = '6f370459a0mshe5afcd3f5b0dab5p16b2a4jsn1d89511e7170';

const bot = new Telegraf(BOT_TOKEN);
  bot.on('text', (ctx) => {
  // Assuming any text message is treated as a potential URL
  const url = ctx.message.text;

  // Call the fetchData function with the user-provided URL
  fetchData(url);
});

// Start the bot
bot.launch();

async function fetchData(url) {
  try {
    const options = {
      method: 'GET',
      url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/post_info',
      params: {
        code_or_id_or_url: url
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);

    // Check if "data" property exists
    if ('data' in response && 'data' in response.data) {
      const mediaUrl = response.data.data.video_url ? response.data.data.video_url + '.mp4' : response.data.data.display_url + '.jpg';

      // Determine whether to send as a photo or a video
      sendMedia(mediaUrl, response.data.data.video_url !== undefined);
    } else {
      console.log("No 'data' property found in the API response.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function sendMedia(mediaUrl, isVideo) {
  const endpoint = isVideo ? 'sendVideo' : 'sendPhoto';

  const fetchOptions = {
    method: 'POST',
    body: JSON.stringify({
      chat_id: CHAT_ID,
      [isVideo ? 'video' : 'photo']: mediaUrl
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, fetchOptions)
    .then(response => response.json())
    .then(result => console.log('Telegram API Result:', result))
    .catch(error => console.error(`Error sending media: ${isVideo ? 'video' : 'photo'}`, error));
}
