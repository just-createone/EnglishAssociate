const { BlazeClient } = require("mixin-node-sdk");
const config = require("./config");

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: config.openai_key,
});
const openai = new OpenAIApi(configuration);

const client = new BlazeClient(
  {
    pin: config.pin,
    client_id: config.client_id,
    session_id: config.session_id,
    pin_token: config.pin_token,
    private_key: config.private_key,
  },
  { parse: true, syncAck: true }
);

client.loopBlaze({
  async onMessage(msg) {
    // console.log(msg);
    const rawData = msg.data.toString();

    const lang = checkLanguage(rawData);

    rawZhData = "";
    rawEnData = "";

    // console.log(lang);
    if (lang === "chinese") {
      console.log("chinese");
      rawZhData = rawData;
      rawEnData = await translate(lang, rawData);
    } else if (lang === "english") {
      console.log("english");
      rawZhData = rawData;
      rawEnData = await translate(lang, rawData);
    } else if (lang === "unknown") {
      console.log("unknown");
      `Only English and Chinese are supported.\n仅支持中文或英文。`;
    }

    const returnZhData = "您好。";
    const returnEnData = "How are you.";

    const rec = `>用户\n英文：${rawEnData}\n中文：${rawZhData}\n\n<助手\n英文：${returnEnData}\n中文：${returnZhData}`;
    await client.sendMessageText(msg.user_id, rec);
  },
  onAckReceipt() {},
});

function checkLanguage(text) {
  const firstCharCode = text.charCodeAt(0);
  if (firstCharCode >= 0x4e00 && firstCharCode <= 0x9fa5) {
    return "chinese";
  } else if (firstCharCode >= 0x00 && firstCharCode <= 0x7f) {
    return "english";
  } else {
    return "unknown";
  }
}

async function translate(lang, text) {
  if (lang === "chinese") {
    // rec = "Hello" + text;
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that translates Chinese to English.",
        },
        {
          role: "user",
          content: `Translate the following Chinese text to English:${text}`,
        },
      ],
    });
    console.log(completion.data.choices[0].message.content);
    return completion.data.choices[0].message.content;
  } else if (lang === "english") {
    rec = "你好" + text;
  }
  return rec;
}
