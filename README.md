# ChatBot IA - Atendimento Clínica Pessini

## 📋 Descrição

Bot de atendimento automatizado para WhatsApp desenvolvido para fins acadêmicos de  uma clínica imaginária. O sistema utiliza Inteligência Artificial (Google Gemini) para fornecer um atendimento virtual completo, incluindo informações sobre a clínica, agendamento de consultas e atendimento ao paciente. O bot esta configurado para não fornecer informações sensíveis.

## 🚀 Principais Funcionalidades

- **Atendimento Virtual 24/7**: IA treinada especificamente para atender pacientes da clínica
- **Agendamento de Consultas**: Sistema completo de agendamento via WhatsApp
- **Histórico de Conversas**: Mantém contexto das conversações por usuário
- **Informações da Clínica**: Especialidades, médicos, horários e localização
- **Controle de Chegada**: Verificação de pacientes para consultas
- **Sistema de Saudação**: Mensagem inicial personalizada por usuário

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **WhatsApp Web.js** - Integração com WhatsApp
- **Google Generative AI (Gemini)** - Inteligência Artificial
- **Docker** - Containerização
- **dotenv** - Gerenciamento de variáveis de ambiente
- **QRCode** - Geração de códigos QR para autenticação

## 📦 Dependências

```json
{
  "@google/generative-ai": "^0.14.1",
  "axios": "^1.7.2",
  "dotenv": "^16.5.0",
  "qrcode": "^1.5.4",
  "qrcode-terminal": "^0.12.0",
  "whatsapp-web.js": "^1.23.0"
}
```

## 🤖 Funcionalidades da IA

### Atendimento Automatizado
- Resposta imediata a perguntas sobre a clínica
- Informações sobre especialidades e médicos
- Orientações sobre localização e contato

### Sistema de Agendamento
- Agendamento completo via chat
- Validação de disponibilidade de médicos
- Confirmação automática de consultas
- Cadastro de novos pacientes

### Controle de Chegada
- Verificação de pacientes para consultas
- Confirmação de agendamentos
- Orientações de espera

### Histórico Inteligente
- Mantém contexto da conversa por usuário
- Respostas personalizadas baseadas no histórico
- Memória de interações anteriores

## 📈 Configurações da IA

### Parâmetros do Gemini
- **Temperature**: 0.8 (criatividade controlada)
- **Max Output Tokens**: 250 (respostas concisas)
- **Model**: gemini-1.5-pro-latest

## 👨‍💻 Autor

**Victor Moreira** - [@Vitao5](https://github.com/Vitao5)
---

**⚠️ Aviso**: Este é um projeto educacional/demonstrativo.
