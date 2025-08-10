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
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const historicoChat = new Map(); 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

//armazena o id de quem já recebeu mensagem de saudação
const usuariosInteracao = new Set();

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr); 

    qrcode.toDataURL(qr, { errorCorrectionLevel: 'H' }, (err, url) => {
        if (err) {
            console.error('Erro ao gerar QR code como imagem:', err);
        } else {
            console.log('QR Code Base64:', url);
        }
    });
});

//conexão com o WhatsApp Web
client.on('ready', () => {
    console.log('Cliente pronto! WhatsApp conectado.');
});

client.on('authenticated', () => {
    console.log('Autenticado com sucesso!');
});

// Tratamento de sinais do sistema para um encerramento limpo do cliente
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
    const userId = message.from;

    // não executa o código se a mensagem for do próprio bot
    if (message.fromMe) {
        return;
    }

    const responder = message.type === 'chat' && !message.fromMe;

    //envia mensagem de saudação inicial e histórico da conversa para dar contexto
    if (!usuariosInteracao.has(userId) && !!responder) {
        const chat = await message.getChat();
        const saudacaoInicial = 'Olá! Eu sou uma I.A. (Inteligência Artificial), atendente virtual da clínica. Estou aqui para ajudar com suas dúvidas e necessidades relacionadas à nossa clínica. Qual é sua pergunta?';
        await chat.sendMessage(saudacaoInicial);
        usuariosInteracao.add(userId);
        if (!historicoChat.has(userId)) {
            setTimeout(() => {
                historicoChat.set(userId, [
                    { role: 'model', parts: [{ text: saudacaoInicial }] }
                ]);
            }, 2000);
        }

    }

    if (responder) {
        try {
            const chat = await message.getChat();
            await chat.sendStateTyping();
    
            let historicoConversaAtual = historicoChat.get(userId) || [];
            historicoConversaAtual.push({ role: 'user', parts: [{ text: message.body }] });

            const conteudoParaEnviar = [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                },
                ...historicoConversaAtual,
                
            ];

            const result = await model.generateContent({
                contents: conteudoParaEnviar,
                generationConfig: {
                    //quanto mais alto o valor, mais criativa a resposta e pode ocilar na resposta
                    temperature: 0.8,
                    //limita o tamanho da resposta e evita custos altos
                    maxOutputTokens: 250
                }

            });

            const respotaRequisicao = result.response.text();
            const respostaIA = respotaRequisicao.trim();

            historicoConversaAtual.push({ role: 'model', parts: [{ text: respostaIA }] });
            historicoChat.set(userId, historicoConversaAtual); 

            setTimeout(async () => {
                await chat.sendMessage(respostaIA);
            }, 2500);

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