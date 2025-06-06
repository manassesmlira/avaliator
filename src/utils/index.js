const dotenv = require('dotenv');
const GoogleFormsService = require('./services/googleForms');
const NotionService = require('./services/notion');
const WhatsappService = require('./services/whatsapp');
const CalculadoraNotas = require('./utils/calcularNota');
const Logger = require('./utils/logger');

class SistemaAvaliacao {
  constructor() {
    // Carregar variáveis de ambiente
    dotenv.config();

    // Inicializar serviços
    this.googleForms = new GoogleFormsService();
    this.notion = new NotionService();
    this.whatsapp = new WhatsappService();
    this.calculadora = new CalculadoraNotas(this.notion);
    this.logger = new Logger('SistemaAvaliacao');
  }

  async processarFormularioEspecifico(formId) {
    try {
      this.logger.info(`Iniciando processamento do formulário ${formId}`);

      // 1. Processar avaliações do Google Forms
      const avaliacoesProcessadas = await this.googleForms.processarAvaliacoes(formId);

      // 2. Enviar notificações por WhatsApp
      const notificacoes = await Promise.all(
        avaliacoesProcessadas.map(async (avaliacao) => {
          try {
            const notificacao = {
              aluno: avaliacao.dadosAluno.nome,
              disciplina: avaliacao.disciplina,
              nota: avaliacao.notaFinal,
              status: avaliacao.status,
              telefone: avaliacao.dadosAluno.telefone
            };

            // Enviar notificação por WhatsApp
            await this.whatsapp.enviarNotificacao(notificacao);

            this.logger.info(`Notificação enviada para ${notificacao.aluno}`);
            return notificacao;
          } catch (erroNotificacao) {
            this.logger.error(`Erro ao enviar notificação para ${avaliacao.dadosAluno.nome}`, erroNotificacao);
            return null;
          }
        })
      );

      return {
        formularioId: formId,
        avaliacoesProcessadas,
        notificacoesEnviadas: notificacoes.filter(n => n !== null)
      };
    } catch (error) {
      this.logger.error(`Erro crítico no processamento do formulário ${formId}`, error);
      throw error;
    }
  }

  async processarFormulariosPendentes() {
    try {
      // Buscar formulários pendentes no Google Forms
      const formulariosPendentes = await this.googleForms.listarFormulariosPendentes();
      
      this.logger.info(`Processando ${formulariosPendentes.length} formulários pendentes`);

      const resultados = await Promise.all(
        formulariosPendentes.map(async (formulario) => {
          try {
            const resultado = await this.processarFormularioEspecifico(formulario.spreadsheetId);
            
            // Marcar formulário como processado
            await this.googleForms.marcarFormularioProcessado(formulario.spreadsheetId);

            return resultado;
          } catch (erroFormulario) {
            this.logger.error(`Erro ao processar formulário ${formulario.spreadsheetId}`, erroFormulario);
            return null;
          }
        })
      );

      return resultados.filter(resultado => resultado !== null);
    } catch (error) {
      this.logger.error('Erro ao processar formulários pendentes', error);
      throw error;
    }
  }

  async executar(formId = null) {
    try {
      const resultados = formId
        ? await this.processarFormularioEspecifico(formId)
        : await this.processarFormulariosPendentes();

      return resultados;
    } catch (error) {
      this.logger.error('Erro na execução do sistema de avaliação', error);
      throw error;
    }
  }

  // Método para gerar relatórios e estatísticas
  async gerarRelatorios() {
    try {
      const relatorios = {
        totalAvaliacoes: 0,
        aprovados: 0,
        reprovados: 0,
        emRecuperacao: 0,
        mediaNotas: 0
      };

      // Buscar resultados no Notion
      const resultadosNotion = await this.notion.buscarResultadosAvaliacoes();

      relatorios.totalAvaliacoes = resultadosNotion.length;
      
      resultadosNotion.forEach(resultado => {
        switch(resultado.status) {
          case 'Aprovado':
            relatorios.aprovados++;
            break;
          case 'Reprovado':
            relatorios.reprovados++;
            break;
          case 'Recuperação':
            relatorios.emRecuperacao++;
            break;
        }
        relatorios.mediaNotas += resultado.nota;
      });

      relatorios.mediaNotas = relatorios.mediaNotas / relatorios.totalAvaliacoes;

      this.logger.info('Relatório gerado:', relatorios);
      return relatorios;
    } catch (error) {
      this.logger.error('Erro ao gerar relatórios', error);
      throw error;
    }
  }
}

// Execução baseada em argumentos de linha de comando
if (require.main === module) {
  const sistemaAvaliacao = new SistemaAvaliacao();
  const formId = process.argv[2]; // Permite passar formId via linha de comando
  
  sistemaAvaliacao.executar(formId)
    .then(resultado => {
      console.log('Processamento concluído:', resultado);
      process.exit(0);
    })
    .catch(erro => {
      console.error('Erro no processamento:', erro);
      process.exit(1);
    });
}

module.exports = SistemaAvaliacao;
