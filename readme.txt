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

🔒 Variáveis de Ambiente
NOTIONAPIKEY
GOOGLEFORMSCREDENTIALS
WHATSAPP_TOKEN
📦 Instalação
bash
Copiar

git clone [repositorio]
npm install
🚀 Execução
bash
Copiar

npm start
🧪 Testes
bash
Copiar

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
👥 Desenvolvedor
Manasses - Desenvolvedor Fullstack

📄 Licença
MIT License

Aguardando próximo passo para detalhar a implementação! 🚀
