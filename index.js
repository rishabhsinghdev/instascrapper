const axios = require('axios');
const { Telegraf } = require('telegraf');

const BOT_TOKEN = '6578601939:AAHeXFA7_4_ZPrQKTTl0bkf1C9Vz5frS-UQ';
const RAPID_API_KEY = '6f370459a0mshe5afcd3f5b0dab5p16b2a4jsn1d89511e7170';

const bot = new Telegraf(BOT_TOKEN);
bot.telegram.deleteWebhook();
bot.on('text', (ctx) => {
  // Extract the chat ID dynamically
  const chatId = ctx.chat.id;

  // Assuming any text message is treated as a potential URL
  const url = ctx.message.text;

  // Check if the URL is from Instagram
  if (url.includes('instagram.com/')) {
    let code;

    // Check for Instagram post, reel, or story
    if (url.includes('/p/')) {
      code = extractCode(url, '/p/');
    } else if (url.includes('/reels/')) {
      code = extractCode(url, '/reels/');
    } else if (url.includes('/stories/')) {
      code = extractCode(url, '/stories/');
    }

    if (code) {
      // Call the fetchData function with the extracted code and chat ID
      fetchData(chatId, code);
    } else {
      // Handle other Instagram URLs or perform a different action
      // You may want to add more conditions or logic here
    }
  } else {
    // Handle non-Instagram URLs or perform a different action
    // You may want to add more conditions or logic here
  }
});

function extractCode(url, keyword) {
  const codeIndex = url.indexOf(keyword) + keyword.length;
  return url.substring(codeIndex);
}

// Start the bot
bot.launch();

async function fetchData(chatId, code) {
  try {
    const options = {
      method: 'GET',
      url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/post_info',
      params: {
        code_or_id_or_url: code
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
      sendMedia(chatId, mediaUrl, response.data.data.video_url !== undefined);
    } else {
      console.log("No 'data' property found in the API response.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function sendMedia(chatId, mediaUrl, isVideo) {
  const endpoint = isVideo ? 'sendVideo' : 'sendPhoto';

  const fetchOptions = {
    method: 'POST',
    body: JSON.stringify({
      chat_id: chatId,
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
