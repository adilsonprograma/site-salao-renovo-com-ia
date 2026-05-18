# 🚀 Quick Start - Renovo Cabeleireiros

**Comece em 5 minutos!**

---

## 1️⃣ Clonar & Entrar

```bash
git clone https://github.com/seu-usuario/projeto-salao-com-ia.git
cd projeto-salao-com-ia
```

---

## 2️⃣ Configurar Variáveis

```bash
cp .env.example .env
```

Edite `.env`:
```env
PORT=3000
GEMINI_API_KEY=              # Deixar em branco por enquanto
WHATSAPP_ACCESS_TOKEN=       # Deixar em branco por enquanto
```

---

## 3️⃣ Iniciar Servidor

```bash
cd backend/python
python main.py
```

**Esperado:**
```
Servidor iniciando na porta 3000...
```

---

## 4️⃣ Abrir no Navegador

```
http://localhost:3000
```

✅ Landing page apareceu?

---

## 5️⃣ Testar Admin

1. Clique em **"Admin"** no header
2. Faça login com:
   - **Usuário**: `admin`
   - **Senha**: `admin123`
3. Você vê o painel

✅ Tudo funcionando?

---

## 🔌 Adicionar Integrações (Opcional)

### Gemini AI

1. [Obtenha a chave](https://aistudio.google.com/app/apikeys)
2. Adicione em `.env`:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```
3. Restart servidor
4. Chat IA funciona

### WhatsApp

1. [Crie app no Meta](https://developers.facebook.com)
2. Configure credenciais em `.env`
3. Configure webhook
4. Agendamentos enviam via WhatsApp

---

## 📚 Próximos Passos

| Quer fazer? | Vá para |
|-----------|---------|
| Entender arquitetura | [ARQUITETURA_DETALHADA.md](docs/ARQUITETURA_DETALHADA.md) |
| Ver todas as rotas | [API.md](docs/API.md) |
| Setup completo | [SETUP.md](docs/SETUP.md) |
| Deploy em produção | [DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Editar o código | Ver [STRUCTURE.md](STRUCTURE.md) |

---

## 🐛 Problemas?

| Erro | Solução |
|------|---------|
| `Address already in use` | Mudar `PORT` em `.env` |
| `Python not found` | Instalar [Python 3.8+](https://python.org) |
| Chat não responde | Adicionar `GEMINI_API_KEY` |
| Admin não carrega | Abrir console (F12) e checar erros |

---

## 💡 Dicas Úteis

```bash
# Testar API
curl http://localhost:3000/api/health

# Testar agendamento
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"test@example.com","telefone":"11999999999","servico":"Corte"}'

# Ver todas as rotas
grep "if pathname ==" backend/python/app/routes.py
```

---

## 📞 Suporte

- 📖 [README Completo](README_NOVO.md)
- 🔌 [API Reference](docs/API.md)
- ⚙️ [Troubleshooting](docs/SETUP.md#troubleshooting)

---

**Pronto para o próximo nível?** Leia o [README completo](README_NOVO.md)! 🎉
