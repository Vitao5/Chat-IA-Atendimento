import pkg from 'whatsapp-web.js';
import 'dotenv/config'; 
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode'
import { GoogleGenerativeAI } from '@google/generative-ai';
import prompt from './prompt.js';

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'bot-clinica-pessini',
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        //false, ele abre o navegador para escanear o QR Code
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log('CHAVE API NULL', GEMINI_API_KEY === null);

const historicoChat = new Map(); 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

//armazena o id de quem já recebeu mensagem de saudação
const usuariosInteracao = new Set();

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr); 

    qrcode.toDataURL(qr, { errorCorrectionLevel: 'H' }, (err, url) => {
        if (!!url) console.log('QR Code Base64:', url)
    });
});

//conexão com o WhatsApp Web
client.on('ready', () => {
    console.log('Cliente pronto! WhatsApp conectado.');
});

client.on('authenticated', () => {
    console.log('Autenticado com sucesso!');
});

process.on('SIGTERM', async () => {
    console.log('(SIGTERM) Encerrando o cliente...');
    await client.destroy();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('(SIGINT) Encerrando o cliente...');
    await client.destroy();
    process.exit(0);
});

client.on('auth_failure', msg => {
    console.error('Falha na autenticação', msg);
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado', reason);
    console.log('Cliente desconectado. Por favor, reinicie o bot manualmente ou via PM2.');
});
// fim conexão com Whatsapp e tratamento de sessão


//interação com a ia
client.on('message', async (message) => {
    const mensagemTexto = message.body;
    const userId = message.from;

    // não executa o código se a mensagem for do próprio bot
    if (message.fromMe) {
        return;
        
    }

    const responder = mensagemTexto.split(' ').includes('/r') && !message.fromMe;

    //envia mensagem de saudação inicial e histórico da conversa para dar contexto
    if (!usuariosInteracao.has(userId) && !!responder) {
        const chat = await message.getChat();
        const initialGreeting = 'Olá! Eu sou um atendente virtual da Clínica Médica Imaginária. Estou aqui para ajudar com suas dúvidas e necessidades relacionadas à nossa clínica. Para interagir comigo, use sempre /r. Qual é sua pergunta?';
        await chat.sendMessage(initialGreeting);
        usuariosInteracao.add(userId);
        if (!historicoChat.has(userId)) {
            historicoChat.set(userId, [
                { role: 'model', parts: [{ text: initialGreeting }] }
            ]);
        }

    }

    if (responder) {
        const mensagemParaIA = mensagemTexto.substring(mensagemTexto.indexOf('/r') + 2).trim();

        try {
            const chat = await message.getChat();
            await chat.sendStateTyping();

            let historicoConversaAtual = historicoChat.get(userId) || [];
            historicoConversaAtual.push({ role: 'user', parts: [{ text: mensagemParaIA }] });

            const contentsToSend = [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Ok, estou pronto para seguir as instruções sobre a Clínica Pessini.' }]
                },
                ...historicoConversaAtual 
            ];

            const result = await model.generateContent({
                contents: contentsToSend
            });

            const respotaRequisicao = result.response.text();
            const respostaIA = respotaRequisicao.trim();

            historicoConversaAtual.push({ role: 'model', parts: [{ text: respostaIA }] });
            historicoChat.set(userId, historicoConversaAtual); // Atualiza o histórico para o usuário

            setTimeout(async () => {
                await chat.sendMessage(respostaIA);
            }, 2000);

        } catch (error) {
            console.error("Erro ao chamar a API Gemini:", error);
            const chat = await message.getChat();
            const errorMessage = "Desculpe, houve um erro ao processar sua solicitação no momento. Por favor, tente novamente mais tarde.";
            await chat.sendMessage(errorMessage);
        }
    }
});
// fim interação com a ia


client.initialize();