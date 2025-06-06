// src/services/notion.js
const { Client } = require('@notionhq/client');

class NotionService {
  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_TOKEN
    });
    this.databaseId = process.env.NOTIONDATABASEID;
  }

  _definirStatusAprovacao(nota) {
    if (nota >= 7) return 'Aprovado';
    if (nota >= 5) return 'Recuperação';
    return 'Reprovado';
  }

  async salvarResultadoAvaliacao(resultado) {
    try {
      const response = await this.notion.pages.create({
        parent: { 
          database_id: this.databaseId 
        },
        properties: {
          'Nome Aluno': {
            title: [
              {
                type: 'text',
                text: { 
                  content: resultado.dadosAluno.nome 
                }
              }
            ]
          },
          'Telefone': {
            rich_text: [
              {
                type: 'text',
                text: { 
                  content: resultado.dadosAluno.telefone || '' 
                }
              }
            ]
          },
          'CPF': {
            rich_text: [
              {
                type: 'text',
                text: { 
                  content: resultado.dadosAluno.cpf || '' 
                }
              }
            ]
          },
          'Email': {
            email: resultado.dadosAluno.email || null
          },
          'Disciplina': {
            select: {
              name: resultado.disciplina
            }
          },
          'Gabarito': {
            rich_text: [
              {
                type: 'text',
                text: { 
                  content: JSON.stringify(resultado.gabarito) 
                }
              }
            ]
          },
          'Resposta Aluno': {
            rich_text: [
              {
                type: 'text',
                text: { 
                  content: JSON.stringify(resultado.respostasAluno) 
                }
              }
            ]
          },
          'Nota': {
            number: resultado.notaFinal
          },
          'Aprovado': {
            select: {
              name: this._definirStatusAprovacao(resultado.notaFinal)
            }
          },
          'Data Avaliação': {
            date: {
              start: new Date().toISOString()
            }
          }
        }
      });

      return response;
    } catch (error) {
      console.error('Erro ao salvar resultado no Notion:', error);
      throw error;
    }
  }

  async buscarGabaritoDisciplina(disciplina) {
    try {
      // Implementar lógica para buscar gabarito específico
      const gabaritosPadrao = {
        'Matemática': ['A','B','C','D','A','B','C','D','E','A'],
        'Português': ['B','A','C','D','B','A','C','D','E','B']
      };

      return {
        disciplina,
        gabarito: gabaritosPadrao[disciplina] || []
      };
    } catch (error) {
      console.error('Erro ao buscar gabarito:', error);
      throw error;
    }
  }

  async processarAvaliacoes(avaliacoes) {
    const resultados = [];
    
    for (let avaliacao of avaliacoes) {
      try {
        const resultado = await this.salvarResultadoAvaliacao(avaliacao);
        resultados.push(resultado);
      } catch (error) {
        console.error(`Erro ao processar avaliação: ${error.message}`);
      }
    }

    return resultados;
  }
}

module.exports = new NotionService();
