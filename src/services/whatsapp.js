// src/services/whatsapp.js
const axios = require('axios');

class WhatsappService {
  constructor() {
    this.apiUrl = process.env.WHASCALE_API_URL;
    this.token = process.env.WASCRIPT_TOKEN;
  }

  async enviarMensagem(dadosNotificacao) {
    try {
      const payload = {
        numero: dadosNotificacao.telefone,
        mensagem: this._montarMensagem(dadosNotificacao)
      };

      const response = await axios.post(`${this.apiUrl}/enviar`, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      throw error;
    }
  }

  _montarMensagem(dadosNotificacao) {
    return `
🎓 Resultado da Avaliação 📊

Olá ${dadosNotificacao.nomeAluno}!

Disciplina: ${dadosNotificacao.disciplina}
Nota: ${dadosNotificacao.nota}
Status: ${dadosNotificacao.status}

Bom trabalho! 👏
    `;
  }

  async verificarNumeroValido(telefone) {
    try {
      const response = await axios.get(`${this.apiUrl}/validar-numero`, {
        params: { numero: telefone },
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      return response.data.valido;
    } catch (error) {
      console.error('Erro ao validar número:', error);
      return false;
    }
  }

  async enviarNotificacaoLote(listaNotificacoes) {
    const resultados = await Promise.all(
      listaNotificacoes.map(async (notificacao) => {
        try {
          return await this.enviarMensagem(notificacao);
        } catch (error) {
          return {
            erro: true,
            detalhes: error.message,
            aluno: notificacao.nomeAluno
          };
        }
      })
    );

    return resultados;
  }
}

module.exports = new WhatsappService();
