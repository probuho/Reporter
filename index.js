import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

dotenv.config();

const { TOKEN } = process.env;
const USERS_FILE = "agenda.json";

async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  return axios.post(url, { chat_id: chatId, text });
}

async function sendDocument(chatId, filePath) {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("document", fs.createReadStream(filePath));

  const url = `https://api.telegram.org/bot${TOKEN}/sendDocument`;
  return axios.post(url, form, { headers: form.getHeaders() });
}

async function sendTextFromFile(chatId, filePath) {
  const MESSAGE = fs.readFileSync(filePath, "utf-8");
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  return axios.post(url, { chat_id: chatId, text: MESSAGE });
}

async function sendMessages() {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));

  for (const user of users) {
    if (!user.isActive) {
      continue;
    }

    try {
      await sendMessage(user.chat_id, `Hola ${user.name}, soy Remi!`);

      if (user.ovam) {
        await sendMessage(user.chat_id, "Te envio el reporte de OVAM");
        await sendTextFromFile(user.chat_id, "./assets/reporte_ovam.txt");
        await sendDocument(user.chat_id, "./assets/reporte_ovam.txt");
      }

      console.log(`✅ Mensaje enviado a ${user.name}`);
    } catch (error) {
      console.error(
        `❌ Error al enviar mensaje a ${user.name}:`,
        error.response?.data || error
      );
    }
  }
}

await sendMessages();
