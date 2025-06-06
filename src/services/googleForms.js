const fs = require('fs');
const { google } = require('googleapis');
const NotionService = require('./notion');
const Logger = require('../utils/logger');

class GoogleFormsService {
  constructor() {
    this.logger = new Logger('GoogleFormsService');
    this.credentialsPath = process.env.GOOGLE_FORMS_CREDENTIALS;
    this.credentials = this._carregarCredenciais();
    this.client = this._inicializarCliente();
    this.notionService = new NotionService();
  }

  _carregarCredenciais() {
    try {
      const credentialsRaw = fs.readFileSync(this.credentialsPath, 'utf8');
      return JSON.parse(credentialsRaw);
    } catch (error) {
      this.logger.error('Falha ao carregar credenciais', error);
      throw new Error('Credenciais do Google inválidas');
    }
  }

  _inicializarCliente() {
    try {
      return new google.auth.GoogleAuth({
        credentials: this.credentials,
        scopes: [
          'https://www.googleapis.com/auth/forms.body.readonly',
          'https://www.googleapis.com/auth/spreadsheets.readonly'
        ]
      });
    } catch (error) {
      this.logger.error('Falha na inicialização do cliente', error);
      throw new Error('Erro na configuração do cliente Google');
    }
  }

  async obterRespostas(formId) {
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.client });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: formId,
        range: 'Respostas!A2:K', 
      });
      const respostas = response.data.values || [];
      return await this._processarRespostas(respostas);
    } catch (error) {
      this.logger.error(`Erro ao obter respostas do formulário ${formId}`, error);
      throw error;
    }
  }

  async _processarRespostas(respostas) {
    const resultados = [];

    for (const resposta of respostas) {
      const dadosAvaliacao = {
        dadosAluno: {
          nome: this._extrairNome(resposta),
          email: this._extrairEmail(resposta),
          telefone: this._extrairTelefone(resposta),
          cpf: this._extrairCPF(resposta)
        },
        disciplina: this._extrairDisciplina(resposta),
        respostasAluno: this._normalizarRespostas(resposta)
      };

      // Buscar gabarito da disciplina no Notion
      const gabarito = await this.notionService.buscarGabaritoDisciplina(dadosAvaliacao.disciplina);

      // Calcular nota
      const resultado = this._corrigirProva(dadosAvaliacao, gabarito);
      resultados.push(resultado);
    }

    return resultados;
  }

  _corrigirProva(dadosAvaliacao, gabarito) {
    const respostasAluno = dadosAvaliacao.respostasAluno.map(r => r.resposta);
    const respostasGabarito = gabarito.gabarito;

    // Calcular quantidade de acertos
    const questoesCorretas = respostasAluno.filter((resposta, index) => 
      resposta === respostasGabarito[index]
    ).length;

    // Calcular nota
    const notaFinal = parseFloat(((questoesCorretas / respostasGabarito.length) * 10).toFixed(2));

    return {
      ...dadosAvaliacao,
      gabarito: gabarito.gabarito,
      notaFinal,
      status: this._definirStatusAprovacao(notaFinal)
    };
  }

  _definirStatusAprovacao(nota) {
    if (nota >= 7) return 'Aprovado';
    if (nota >= 5) return 'Recuperação';
    return 'Reprovado';
  }

  _extrairNome(resposta) {
    return resposta[1] || 'Aluno Não Identificado';
  }

  _extrairEmail(resposta) {
    return resposta[2] || null;
  }

  _extrairTelefone(resposta) {
    const telefone = resposta[3] || '';
    return telefone.replace(/\D/g, '');
  }

  _extrairCPF(resposta) {
    const cpf = resposta[4] || '';
    return cpf.replace(/\D/g, '');
  }

  _extrairDisciplina(resposta) {
    // Ajustar índice conforme estrutura real da planilha
    return resposta[5] || 'Disciplina Não Identificada';
  }

  _normalizarRespostas(resposta) {
    // Ajustar slice para pular colunas de identificação
    const respostasAluno = resposta.slice(6);
    return respostasAluno.map((resp, index) => ({
      questaoId: `questao_${index + 1}`,
      resposta: resp
    }));
  }

  async processarAvaliacoes(formId) {
    try {
      const respostas = await this.obterRespostas(formId);
      const resultadosProcessados = await this.notionService.processarAvaliacoes(respostas);
      
      // Marcar formulário como processado
      await this.marcarFormularioProcessado(formId);

      return resultadosProcessados;
    } catch (error) {
      this.logger.error(`Erro ao processar avaliações do formulário ${formId}`, error);
      throw error;
    }
  }

  async listarFormulariosPendentes() {
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.client });
      const response = await sheets.spreadsheets.list({
        fields: 'sheets(properties(sheetId,title))'
      });
      
      const formulariosPendentes = response.data.sheets.filter(
        sheet => !sheet.properties.title.includes('PROCESSADO')
      );
      
      this.logger.info(`Formulários pendentes: ${formulariosPendentes.length}`);
      return formulariosPendentes;
    } catch (error) {
      this.logger.error('Erro ao listar formulários', error);
      throw error;
    }
  }

  async marcarFormularioProcessado(formId) {
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.client });
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: formId,
        resource: {
          requests: [{
            updateSheetProperties: {
              properties: { title: `${sheets.title}_PROCESSADO` },
              fields: 'title'
            }
          }]
        }
      });
      
      this.logger.info(`Formulário ${formId} marcado como processado`);
    } catch (error) {
      this.logger.error(`Erro ao marcar formulário ${formId}`, error);
      throw error;
    }
  }
}

module.exports = new GoogleFormsService();
