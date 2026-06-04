# GCP Quiz — Atividade de Extensão 🚀

Plataforma web com questionário para adolescentes + painel administrativo em tempo real.

---

## ⚙️ Configuração (obrigatória antes do deploy)

### 1. Configure o Firebase

1. Acesse https://console.firebase.google.com e crie um projeto chamado `gcp-quiz`
2. Clique em **"Adicionar app" → Web** e copie as credenciais
3. Abra o arquivo `src/firebaseConfig.js` e cole suas credenciais no lugar dos valores `SUA_API_KEY_AQUI`, etc.
4. No menu esquerdo do Firebase, ative:
   - **Firestore Database** → modo produção → crie as regras abaixo
   - **Authentication** → método **E-mail/Senha** → cadastre seu e-mail e senha de admin

### 2. Regras do Firestore

No console do Firebase → Firestore → Regras, cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quiz_responses/{docId} {
      allow create: if true;
      allow read: if request.auth != null;
    }
  }
}
```

### 3. Instale e rode localmente

```bash
npm install
npm run dev
```

### 4. Build para produção

```bash
npm run build
```

---

## 🌐 Deploy na Vercel

1. Suba o projeto para um repositório GitHub
2. Acesse https://vercel.com → **Add New → Project** → selecione o repositório
3. Clique em **Deploy**

**Links após o deploy:**
- Questionário (alunos): `https://seu-app.vercel.app/`
- Painel admin: `https://seu-app.vercel.app/admin-gcp`

---

## 📁 Estrutura do Projeto

```
gcp-quiz/
├── src/
│   ├── components/
│   │   ├── Quiz.jsx            # Questionário para os alunos
│   │   └── AdminDashboard.jsx  # Painel protegido do professor
│   ├── firebaseConfig.js       # ⚠️ Coloque suas credenciais aqui
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```
