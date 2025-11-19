// ===============================
// CONFIGURAÇÕES INICIAIS
// ===============================
const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");

const client = new Client({
    puppeteer: { headless: false }  // deixa mais humano e reduz risco
});

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Controle de estado e antiflood
const userStates = new Map();
const lastMessageTime = new Map();

// ===============================
// EVENTOS BÁSICOS
// ===============================
client.on("qr", qr => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("🟢 Movvi está online e pronto para atender!");
});

client.initialize();

// ===============================
// FUNÇÕES AUXILIARES
// ===============================

// Evita flood (proteção anti-ban)
function canRespond(user) {
    const now = Date.now();
    const last = lastMessageTime.get(user) || 0;
    if (now - last < 2000) return false; // 2 seg entre respostas
    lastMessageTime.set(user, now);
    return true;
}

// Envia mensagens com digitação simulada
async function sendTyping(chat, text, ms = 2500) {
    await delay(800);
    await chat.sendStateTyping();
    await delay(ms);
    await chat.sendMessage(text);
}

// ===============================
// MENU PRINCIPAL
// ===============================
async function sendMainMenu(chat, name) {
    await sendTyping(chat,
        `Olá, ${name}! 👋\nSou o Movvi, Assistente Virtual da *MMG*.\nComo posso te ajudar hoje?\n\n` +
        `1️⃣ - Trabalhar com a MMG\n` +
        `2️⃣ - Pagamento\n` +
        `3️⃣ - Cartão Ponto\n` +
        `4️⃣ - Uniformes\n` +
        `5️⃣ - FGTS\n` +
        `6️⃣ - Holerite\n` +
        `7️⃣ - Endereços MMG\n` +
        `8️⃣ - Falar com Atendente\n\n` +
        `🔁 Digite *9* para voltar ao menu a qualquer momento.`
    );
}

// ===============================
// ATENDIMENTO DE MENSAGENS
// ===============================
client.on("message", async msg => {
    const user = msg.from;
    const chat = await msg.getChat();

    if (!msg.from.endsWith("@c.us")) return;

    // Proteção anti-flood
    if (!canRespond(user)) return;

    const contact = await msg.getContact();
    const name = contact.pushname?.split(" ")[0] || "amigo";

    // ===============================
    // SAUDAÇÕES
    // ===============================
    if (/^(oi|opa|olá|ola|bom dia|boa tarde|boa noite)$/i.test(msg.body)) {
        userStates.set(user, "menu");
        return sendMainMenu(chat, name);
    }

    // ===============================
    // VOLTAR AO MENU
    // ===============================
    if (msg.body === "9") {
        userStates.delete(user);
        return sendMainMenu(chat, name);
    }

    // ===============================
    // MENU DOS UNIFORMES
    // ===============================
    if (userStates.get(user) === "uniformes") {

        if (msg.body === "1") {
            await sendTyping(chat,
                "🧥 *Devolução de Uniformes*\n" +
                "Se devolver até *quinta-feira*, o reembolso cai na *terça-feira seguinte*.\n" +
                "Caso contrário, somente na terça da semana seguinte."
            );

            return sendTyping(chat,
                "Endereços para devolução:\n" +
                "🏢 Cascavel: Rua Elis Regina, 205\n" +
                "🏢 Medianeira: Avenida Brasília, 161\n\n" +
                "Comunicar devolução: https://wa.me/554599654495"
            );
        }

        if (msg.body === "2") {
            return sendTyping(chat,
                "🧵 *Solicitar Uniformes*\n" +
                "Fale com nossa equipe:\n\n" +
                "https://wa.me/554598010272\n" +
                "https://wa.me/554599867945"
            );
        }

        return sendTyping(chat, "Escolha *1* para devolução ou *2* para solicitação.\nDigite *9* para voltar ao menu.");
    }

    // ==========================================================
    // MENU PRINCIPAL - OPÇÕES
    // ==========================================================

    switch (msg.body) {

        case "1":
            await sendTyping(chat,
                "😊 Obrigado pelo interesse em trabalhar conosco!"
            );
            await sendTyping(chat,
                "Para se candidatar, acesse o formulário:\nhttps://site-entrevista.netlify.app/"
            );
            return sendTyping(chat,
                "Após preencher, aguarde nosso contato.\nEm caso de dúvidas:\n" +
                "Cascavel: https://wa.me/554599654495\n" +
                "Medianeira: https://wa.me/554598390431"
            );

        case "2":
            await sendTyping(chat, "💰 *Informações de pagamento:*");
            await sendTyping(chat,
                "📅 Pagamos todo dia *10* e *25*.\n" +
                "Se cair no fim de semana/feriado → próximo dia útil."
            );
            return sendTyping(chat,
                "📌 1 a 15 → recebe dia 25\n📌 16 a 30/31 → recebe dia 10\n\nDúvidas: https://wa.me/554599710029"
            );

        case "3":
            return sendTyping(chat,
                "🕒 *Cartão Ponto*\nSe tiver dúvidas, fale com nosso suporte:\nhttps://wa.me/554599655980"
            );

        case "4":
            userStates.set(user, "uniformes");
            return sendTyping(chat,
                "🧥 *Uniformes*\n1️⃣ Devolução\n2️⃣ Solicitação\n\nDigite *9* para voltar."
            );

        case "5":
            await sendTyping(chat,
                "📄 *FGTS – Como sacar:*\n1️⃣ Tire o extrato analítico da Caixa (app FGTS ou agência)."
            );
            await sendTyping(chat,
                "2️⃣ Envie o extrato para a Maira:\n📱 45 9965-5980"
            );
            return sendTyping(chat,
                "3️⃣ A Caixa libera saque somente *90 dias após o último dia trabalhado*."
            );

        case "6":
            await sendTyping(chat,
                "📑 *Holerite*\nAcesse:\nhttps://mmgcascavel.com.br/MMG/"
            );
            await sendTyping(chat,
                "Login: código de registro\nSenha: 4 primeiros dígitos do CPF"
            );
            return sendTyping(chat,
                "Consulte sempre quinzena fechada:\n01–15 e 16–30/31."
            );

        case "7":
            await sendTyping(chat, "📍 *Endereços MMG:*");
            await sendTyping(chat, "🏢 Cascavel: Rua Elis Regina, 205");
            return sendTyping(chat, "🏢 Medianeira: Avenida Brasília, 161");

        case "8":
            return sendTyping(chat,
                "👨‍💼 *Atendentes*\n" +
                "Cascavel: https://wa.me/554599654495\n" +
                "Medianeira: https://wa.me/554598390431"
            );
    }
});
