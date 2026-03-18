# 📚 Sistema de Documentação Automática - Versão Genérica

> **Sistema modular para geração automática de documentação técnica padronizada - Adaptado para qualquer projeto**

Esta é uma versão **limpa e genérica** do sistema de documentação automática, removendo todas as referências específicas da Locaweb para permitir uso em qualquer projeto.

---

## 🎯 O que Este Sistema Faz

- **Gera documentação automaticamente** baseada no seu código
- **Analisa sua aplicação** (stack, dependências, endpoints, banco de dados)
- **Cria documentação padronizada** (README, APPLICATION, DEVELOPMENT)
- **Documenta funcionalidades técnicas** detalhadamente
- **Mantém consistência** entre projetos

---

## 📁 Arquivos Criados (Versão Genérica)

```
.cursor/rules/
├── _main_generic.mdc              # 🚨 Sistema principal
├── readme_generic.mdc             # 📖 Gerador de README
├── application_generic.mdc        # 🔧 Gerador de APPLICATION 
├── development_generic.mdc        # 💻 Gerador de DEVELOPMENT
├── tech-flow_generic.mdc         # 📋 Gerador de fluxos técnicos
├── templates/                     # 📝 Templates limpos
│   ├── readme-template_generic.mdc
│   ├── application-template_generic.mdc
│   └── development-template_generic.mdc
├── context/                       # 📊 Contextos genéricos
│   ├── project-services_generic.mdc
│   └── project-patterns_generic.mdc
└── README_GENERIC_SYSTEM.md      # 📋 Este arquivo
```

---

## 🚀 Como Usar (3 Passos)

### **Passo 1: Substituir Arquivos**
```bash
# Renomeie os arquivos genéricos removendo "_generic"
mv _main_generic.mdc _main.mdc
mv readme_generic.mdc readme.mdc  
mv application_generic.mdc application.mdc
mv development_generic.mdc development.mdc
mv tech-flow_generic.mdc tech-flow.mdc

# Templates
cd templates/
mv readme-template_generic.mdc readme-template.mdc
mv application-template_generic.mdc application-template.mdc
mv development-template_generic.mdc development-template.mdc

# Contextos
cd ../context/
mv project-services_generic.mdc project-services.mdc
mv project-patterns_generic.mdc project-patterns.mdc
```

### **Passo 2: Personalizar Contextos**
Edite os arquivos de contexto para seu projeto:

**`context/project-services.mdc`**:
```markdown
# Substitua os exemplos pelos seus serviços reais
| Service | Type | Purpose | URL/Endpoint |
|---------|------|---------|--------------|
| user-api | API | SEU sistema de usuários | https://sua-api.com/users |
| sua-database | Database | SEU banco principal | postgresql://... |
```

**`context/project-patterns.mdc`**:
```markdown  
# Adapte para seus padrões técnicos
- Sua stack tecnológica
- Suas convenções de código
- Seus padrões de segurança
- Seus processos de deploy
```

### **Passo 3: Usar os Comandos**
```bash
# Gerar documentação completa
doc:completa

# Ou individual
doc:readme
doc:application
doc:development
doc:tech-flow autenticação
```

---

## ⚙️ Personalização Avançada

### **1. Adaptar Templates**
Edite `templates/*.mdc` para refletir:
- Sua stack tecnológica específica
- Seus badges/shields personalizados
- Sua estrutura de projeto
- Seus padrões de nomenclatura

### **2. Adicionar Contextos Próprios**
Crie arquivos específicos em `context/`:
```
context/
├── your-apis.mdc          # Suas APIs externas
├── your-services.mdc      # Seus microsserviços  
├── your-infrastructure.mdc # Sua infraestrutura
└── your-team-standards.mdc # Padrões da sua equipe
```

### **3. Modificar Detecção Automática**
Nos arquivos `.mdc`, adapte as seções de detecção:
```markdown
# Em readme.mdc, por exemplo:
**Python/FastAPI:**
- `pyproject.toml` → Dependencies
- `main.py` → Entry point
- Porta padrão: 8000

**Sua Stack:**
- `seu-arquivo-config` → Suas dependências
- `seu-entry-point` → Seu ponto de entrada
- Porta padrão: [sua-porta]
```

---

## 🔧 Diferenças da Versão Original

### **❌ Removido (Específico da Locaweb):**
- Referências a squads da Locaweb  
- URLs do Azure DevOps específicos
- Inventory de 378 aplicações da Locaweb
- Padrões de infraestrutura (F5, Loki, CAS)
- Terminologias específicas (SAPI, Product API)
- Contexto de provisionamento/produtos

### **✅ Mantido (Genérico e Útil):**
- Sistema de comandos automáticos
- Templates profissionais
- Detecção automática de stack
- Busca semântica no código  
- Estrutura de documentação
- Análise de dependências
- Mapeamento de endpoints
- Diagramas Mermaid

---

## 🎨 Exemplos de Personalização

### **Para um E-commerce:**
```markdown
# context/ecommerce-services.mdc
| Service | Type | Purpose |
|---------|------|---------|
| product-catalog | API | Catálogo de produtos |
| cart-service | API | Carrinho de compras |
| payment-gateway | External | Processamento de pagamento |
| inventory-service | API | Controle de estoque |
```

### **Para uma SaaS:**
```markdown
# context/saas-patterns.mdc
## Padrões Multi-tenant
- Tenant isolation por schema
- Tenant ID em todas as queries
- Rate limiting per tenant

## Padrões de Billing  
- Subscription management
- Usage tracking
- Invoice generation
```

### **Para um Sistema Educacional:**
```markdown
# context/education-services.mdc  
| Service | Type | Purpose |
|---------|------|---------|
| student-api | API | Gestão de estudantes |
| course-service | API | Cursos e conteúdo |
| assessment-engine | API | Avaliações e provas |
| progress-tracker | API | Progresso do aluno |
```

---

## 🚨 Comandos Funcionam Igual

Mesmo na versão genérica, os comandos funcionam exatamente igual:

```bash
doc:readme           # Gera README.md
doc:application      # Gera APPLICATION.md
doc:development      # Gera DEVELOPMENT.md  
doc:tech-flow login  # Gera docs/flows/auth/login.md
doc:completa         # Gera tudo
doc:status           # Lista arquivos gerados
doc:help             # Mostra ajuda
```

---

## 💡 Dicas de Uso

### **1. Comece Simples**
- Use primeiro os templates como estão
- Gere documentação básica
- Vá personalizando gradualmente

### **2. Mantenha Contextos Atualizados**
```markdown
# Sempre que adicionar novos serviços:
# 1. Atualize project-services.mdc
# 2. Execute doc:application novamente
# 3. Documentação será atualizada automaticamente
```

### **3. Aproveite a Busca Semântica**
```bash
# O sistema analisa seu código real:
doc:tech-flow "sistema de pagamento"
# → Vai buscar no SEU código como pagamento funciona
# → Vai documentar baseado no que encontrar
```

### **4. Use para Onboarding**
- `doc:development` é perfeito para novos devs
- `doc:application` para outros times/IAs
- `doc:readme` como porta de entrada

---

## 🔍 Tecnologias Suportadas

O sistema detecta automaticamente:

- **Ruby/Rails** (Gemfile, routes.rb, controllers)
- **Node.js** (package.json, Express routes)
- **Python/Django** (requirements.txt, models.py, urls.py)  
- **Python/FastAPI** (pyproject.toml, main.py)
- **PHP/Laravel** (composer.json, routes, controllers)
- **Java/Spring** (pom.xml, application.properties)
- **C#/.NET** (*.csproj, Program.cs)
- **Docker** (docker-compose.yml, Dockerfile)

E você pode adicionar suporte a mais tecnologias editando os arquivos `.mdc`!

---

## 🎯 Resultado Final

Depois de personalizado, você terá:

```
/docs/
├── README.md           # Portal de entrada profissional
├── APPLICATION.md      # Mapeamento técnico completo
├── DEVELOPMENT.md      # Guia de setup para devs
└── flows/             # Documentação técnica detalhada
    ├── auth/
    ├── payment/
    └── features/
```

**Tudo gerado automaticamente baseado no SEU código!** 🚀

---

## 📞 Suporte

Se tiver dúvidas sobre como adaptar:
1. Analise os templates existentes  
2. Compare com a versão original da Locaweb
3. Faça testes pequenos primeiro
4. Documente suas personalizações

---

**🎉 Parabéns!** Você agora tem um sistema de documentação automática profissional que funciona com qualquer projeto!
