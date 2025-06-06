// src/utils/calcularNota.js
class CalculadoraNotas {
  constructor(notionService) {
    this.notionService = notionService;
  }

  async calcularNota(respostasAluno, gabarito) {
    // Comparar respostas do aluno com gabarito
    const resultadoCorrecao = this._corrigirProva(respostasAluno, gabarito);
    
    // Calcular nota final
    const notaFinal = this._calcularPontuacao(resultadoCorrecao);
    
    // Determinar status de aprovação
    const statusAprovacao = this._determinarStatusAprovacao(notaFinal);
    
    return {
      notaFinal,
      questoesCorretas: resultadoCorrecao.corretas,
      questoesErradas: resultadoCorrecao.erradas,
      statusAprovacao,
      detalhesCorrecao: resultadoCorrecao.detalhes
    };
  }

  _corrigirProva(respostasAluno, gabarito) {
    const resultados = {
      corretas: 0,
      erradas: 0,
      detalhes: []
    };

    respostasAluno.forEach((resposta, index) => {
      const respostaCorreta = gabarito[index];
      
      if (resposta === respostaCorreta) {
        resultados.corretas++;
        resultados.detalhes.push({
          questao: index + 1,
          respostaAluno: resposta,
          respostaCorreta: respostaCorreta,
          status: 'Correta'
        });
      } else {
        resultados.erradas++;
        resultados.detalhes.push({
          questao: index + 1,
          respostaAluno: resposta,
          respostaCorreta: respostaCorreta,
          status: 'Errada'
        });
      }
    });

    return resultados;
  }

  _calcularPontuacao(resultadoCorrecao) {
    const totalQuestoes = resultadoCorrecao.corretas + resultadoCorrecao.erradas;
    const notaFinal = (resultadoCorrecao.corretas / totalQuestoes) * 10;
    return Number(notaFinal.toFixed(2));
  }

  _determinarStatusAprovacao(notaFinal) {
    if (notaFinal >= 7.0) return 'Aprovado';
    if (notaFinal >= 5.0) return 'Recuperação';
    return 'Reprovado';
  }

  async registrarNotaNoHistorico(dadosAluno, dadosNota, informacoesAvaliacao) {
    // Preparar registro completo para salvar no Notion
    const registroAvaliacao = {
      // Dados do Aluno
      'Nome Aluno': dadosAluno.nome,
      'Telefone': dadosAluno.telefone,
      'CPF': dadosAluno.cpf,
      'Email': dadosAluno.email,

      // Dados da Avaliação
      'Disciplina': dadosAluno.disciplina,
      'Gabarito': JSON.stringify(informacoesAvaliacao.gabarito),
      'Resposta Aluno': JSON.stringify(informacoesAvaliacao.respostasAluno),
      
      // Resultados
      'Nota': dadosNota.notaFinal,
      'Aprovado': dadosNota.statusAprovacao,
      'Data Avaliação': new Date().toISOString().split('T')[0],

      // Detalhes adicionais
      detalhesCorrecao: JSON.stringify(dadosNota.detalhesCorrecao)
    };

    // Salvar registro no Notion
    return await this.notionService.salvarResultadoAvaliacao(registroAvaliacao);
  }

  // Método para gerar relatório detalhado de desempenho
  gerarRelatorioDesempenho(dadosNota) {
    return {
      totalQuestoes: dadosNota.questoesCorretas + dadosNota.questoesErradas,
      questoesCorretas: dadosNota.questoesCorretas,
      questoesErradas: dadosNota.questoesErradas,
      percentualAcerto: (dadosNota.questoesCorretas / (dadosNota.questoesCorretas + dadosNota.questoesErradas)) * 100,
      detalhesQuestoes: dadosNota.detalhesCorrecao
    };
  }
}

module.exports = CalculadoraNotas;
