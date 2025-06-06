// src/services/whatsapp.js
const axios = require('axios');

class WhatsappService {
  constructor() {
    this.apiUrl = process.env.WHASCALE_API_URL;
    this.token = process.env.WASCRIPT_TOKEN;
  }

  async enviarNotificacao(dadosNotificacao) {
    try {
      // Validar dados conforme colunas do Notion
      this._validarDadosNotificacao(dadosNotificacao);

      // Preparar payload
      const payload = {
        numero: dadosNotificacao.telefone,
        mensagem: this._montarMensagem(dadosNotificacao)
      };

      // Enviar mensagem
      const response = await axios.post(`${this.apiUrl}/enviar`, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        enviado: true,
        detalhes: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar notificação', {
        aluno: dadosNotificacao['Nome Aluno'],
        erro: error.message
      });
      throw new Error(`Falha no envio de notificação: ${error.message}`);
    }
  }

  _validarDadosNotificacao(dadosNotificacao) {
    const camposObrigatorios = [
      'Nome Aluno',
      'Telefone',
      'Disciplina',
      'Nota',
      'Aprovado'
    ];

    camposObrigatorios.forEach(campo => {
      if (!dadosNotificacao[campo]) {
        throw new Error(`Campo obrigatório ausente: ${campo}`);
      }
    });
  }

  _montarMensagem(dadosNotificacao) {
    return `
🎓 Resultado da Avaliação 📊

Aluno(a): ${dadosNotificacao['Nome Aluno']}
Disciplina: ${dadosNotificacao['Disciplina']}
Nota: ${dadosNotificacao['Nota']}
Status: ${dadosNotificacao['Aprovado']}
Data da Avaliação: ${dadosNotificacao['Data Avaliação']}

${this._getMensagemMotivacional(dadosNotificacao['Aprovado'])}
    `;
  }

  _getMensagemMotivacional(status) {
    switch(status) {
      case 'Aprovado':
        return "🎉 Parabéns! Seu esforço foi recompensado!";
      case 'Recuperação':
        return "⚠️ Não desista! Há uma chance de recuperação.";
      case 'Reprovado':
        return "📚 Continue se esforçando. Cada desafio é uma oportunidade de aprendizado.";
      default:
        return "Continue determinado em seus estudos!";
    }
  }

  async enviarNotificacoesLote(listaNotificacoes) {
    console.log(`Iniciando envio de notificações em lote. Total: ${listaNotificacoes.length}`);
    
    const resultados = await Promise.all(
      listaNotificacoes.map(async (notificacao) => {
        try {
          const resultado = await this.enviarNotificacao(notificacao);
          return {
            aluno: notificacao['Nome Aluno'],
            ...resultado
          };
        } catch (error) {
          return {
            aluno: notificacao['Nome Aluno'],
            enviado: false,
            erro: error.message
          };
        }
      })
    );

    // Resumo do processamento em lote
    const resumo = {
      total: listaNotificacoes.length,
      enviadas: resultados.filter(r => r.enviado).length,
      falhas: resultados.filter(r => !r.enviado).length
    };

    console.log('Resumo de envio de notificações em lote', resumo);
    return resultados;
  }
}

module.exports = WhatsappService;
