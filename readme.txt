📋 Documentação do Projeto: Sistema de Avaliação Automatizado

🚀 Projeto: Sistema de Avaliação Automatizado

📝 Descrição

Sistema para processamento automático de avaliações, integração com Google Forms, Notion e notificações.

🎯 Objetivos

Capturar respostas de avaliações

Corrigir provas automaticamente

Registrar notas no Notion

Gerar histórico escolar

Notificar alunos sobre resultados

🛠️ Tecnologias

Node.js

GitHub Actions

Notion API

Google Forms API

Whatsapp API

📊 Arquitetura

projeto/

│

├── src/

│ ├── services/

│ │ ├── googleForms.js

│ │ ├── notion.js

│ │ └── whatsapp.js

│ │

│ ├── utils/

│ │ └── calcularNota.js

│ │

│ └── index.js

│

├── .github/

│ └── workflows/

│ └── processar-notas.yml

│

├── package.json

└── README.md

🔧 Fluxo Operacional

Aluno realiza prova no Google Forms
Sistema captura respostas
Compara com gabarito no Notion
Calcula nota automaticamente
Salva nota no Notion
Atualiza histórico escolar
Envia notificação ao aluno
🚀 Acionamento Automático

Quando um aluno preenche o formulário no Google Forms:

Webhook do Google Forms é disparado
Aciona automaticamente o GitHub Actions

Workflow de processamento de notas é iniciado

Sistema processa a avaliação em tempo real


Tabela de Resultados de Avaliações
Coluna	Tipo	Descrição	Exemplo
Nome Aluno	Title	Nome completo do aluno	"João Silva"
Telefone	Texto	Número de telefone do aluno	"11988887777"
CPF	Texto	Documento de identificação	"12345678900"
Email	Email	Endereço de email do aluno	"joao.silva@escola.com"
Disciplina	Select	Matéria da avaliação	"Matemática", "Português"
Gabarito	Texto/Array	Respostas corretas da prova	"[A,B,C,D,A,B,C,D,E,A]"
Resposta Aluno	Texto/Array	Respostas marcadas pelo aluno	"[B,B,C,D,B,B,C,D,E,B]"
Nota	Número	Pontuação da avaliação	7.5
Aprovado	Select	Status de aprovação	"Aprovado", "Recuperação", "Reprovado"
Data Avaliação	Data	Data da realização da prova	"2024-02-15"


🔒 Variáveis de Ambiente

NOTION
NOTION_TOKEN=

NOTIONDATABASEID=

WHATSAPP
WHASCALEAPIURL=

WASCRIPT_TOKEN=

EMAIL
EMAIL_HOST=

EMAIL_PORT=

EMAIL_USER=

EMAIL_PASS=

EMAIL_FROM=

GOOGLE FORMS
GOOGLEFORMSCREDENTIALS=

GITHUB
GITHUBACTIONSTOKEN=

AMBIENTE
NODE_ENV=

📦 Instalação Dependências

npm install googleapis fs
npm install @notionhq/client
npm install axios
npm install dotenv
git clone [repositorio]

npm install
🚀 Execução

npm start

🧪 Testes

npm test

🤝 Contribuição

Faça fork do projeto

Crie branch feature

Commit suas alterações

Abra Pull Request

📌 Próximas Etapas

Implementar correção automática

Integrar APIs

Configurar notificações

Otimizar processo de webhook

👥 Desenvolvedor

Manasses - Desenvolvedor BackEnd

📄 Licença

MIT License

Principais adições:

Seção "🚀 Acionamento Automático"
Detalhamento do fluxo de webhook
Descrição do processo de trigger do GitHub Actions