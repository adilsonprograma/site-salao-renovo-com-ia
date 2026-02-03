# ✂️ Renovo Cabeleireiros & 🤖 ColorIA Chatbot

> Um projeto híbrido combinando uma Landing Page Institucional com um Assistente Virtual de Colorimetria baseado em regras.

![Status do Projeto](https://img.shields.io/badge/Status-Concluído-brightgreen)
![Tecnologias](https://img.shields.io/badge/HTML5-CSS3-JavaScript)

## 📖 Sobre o Projeto

Este projeto foi desenvolvido como parte dos estudos em **Engenharia de Software**. O objetivo foi criar uma solução web completa que atenda a duas necessidades:
1.  **Institucional:** Apresentar o salão "Renovo Cabeleireiros", seus serviços e facilitar o contato.
2.  **Funcionalidade Interativa:** Implementar um **Chatbot (ColorIA)** que utiliza lógica condicional para auxiliar clientes em dúvidas sobre colorimetria capilar.

O diferencial técnico deste projeto é a unificação de interfaces distintas (Site Institucional + Widget de Chat Flutuante) em uma experiência de usuário fluida e responsiva.

---

## 🚀 Funcionalidades

### 🏢 Site Institucional (Landing Page)
* **Design Responsivo:** Layout adaptável para dispositivos móveis e desktops.
* **Navegação Fluida:** Menu com links de âncora para seções específicas.
* **Integração de API:** Consumo da API **ViaCEP** para preenchimento automático de endereço no formulário de contato.
* **Tabela de Horários:** Exibição clara e estilizada dos horários de funcionamento.

### 🤖 ColorIA (Chatbot Inteligente)
* **Interface Flutuante (Widget):** O chat pode ser aberto ou minimizado sem sair da página principal.
* **Lógica de Estado (State Machine):** O bot "lembra" em qual etapa da conversa está (cor base -> objetivo -> recomendação).
* **Prevenção de Erros:** Validações simples para garantir que o usuário responda o que foi perguntado.
* **Recomendações Técnicas:** Lógica baseada em princípios reais de colorimetria (ex: "tinta não clareia tinta").

---

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura semântica (`<main>`, `<nav>`, `<header>`, `<footer>`).
* **CSS3:**
    * **Flexbox:** Para alinhamento de layouts.
    * **CSS Variables:** Cores e fontes padronizadas.
    * **Animations:** Efeito de *fade-in* nas mensagens do chat.
    * **Media Queries:** Para responsividade em celulares.
* **JavaScript (ES6+):**
    * **DOM Manipulation:** Controle de elementos da tela.
    * **Fetch API / Async Await:** Para requisições HTTP assíncronas (ViaCEP).
    * **Event Listeners:** Captura de cliques e interação do teclado.

---

## 🧠 Conceitos de Engenharia Aplicados

Para fins de estudo e documentação técnica, aqui estão os conceitos chave implementados:

### 1. Consumo de API Assíncrona (AJAX moderno)
No formulário de contato, utilizamos `async/await` para buscar dados do CEP. Isso evita que a página "congele" enquanto busca os dados no servidor do ViaCEP.

```javascript
// Exemplo do código utilizado
async function buscarEndereco(cep) {
    const consulta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    // ... processamento dos dados
}# progeto-renovo-com-ia
