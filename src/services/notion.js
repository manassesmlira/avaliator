// src/services/googleForms.js
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const forms = google.forms('v1');

class GoogleFormsService {
  constructor() {
    this.credentials = JSON.parse(
      fs.readFileSync(process.env.GOOGLE_FORMS_CREDENTIALS)
    );
    this.client = this.initializeClient();
  }

  initializeClient() {
    const client = new google.auth.GoogleAuth({
      credentials: this.credentials,
      scopes: [
        'https://www.googleapis.com/auth/forms.body.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ]
    });
    return client;
  }

  async listarFormularios() {
    try {
      const forms = await this.client.forms.list();
      return forms.data.items;
    } catch (error) {
      console.error('Erro ao listar formulários:', error);
      throw error;
    }
  }

  async obterRespostas(formId) {
    try {
      const respostas = await this.client.forms.responses.list({
        formId: formId
      });
      return this.processarRespostas(respostas.data);
    } catch (error) {
      console.error('Erro ao obter respostas:', error);
      throw error;
    }
  }

  processarRespostas(respostas) {
    // Lógica para extrair e normalizar respostas
    return respostas.map(resposta => ({
      alunoId: resposta.respondentEmail,
      respostas: resposta.answers
    }));
  }
}

module.exports = new GoogleFormsService();
