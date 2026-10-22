const express = require('express');
const app = express();
const PORT = 8000;

app.use(express.urlencoded({ extended: true }));

function logConsole(req, dataOutput) {
  const dataHora = new Date().toLocaleString('pt-BR');
  const endpoint = req.originalUrl || req.url;
  console.log(`[${dataHora}] | Endpoint: ${endpoint} | Saída: ${JSON.stringify(dataOutput)}`);
}

const saudacoes = {
  'pt-br': 'Olá',
  'es': 'Hola',
  'en': 'Hello'
};

// ROTAS - VERSÃO 1 (v1)

app.get('/v1/hi', (req, res) => {
  const out = { msg: "Hello, world!" };
  logConsole(req, out);
  res.status(200).json(out);
});

app.get('/v1/hi/user/:name', (req, res) => {
  const out = { msg: "Hello, " + req.params.name };
  logConsole(req, out);
  res.status(200).json(out);
});

app.post('/v1/hi', (req, res) => {
  const { name } = req.body;
  if (!name) {
    const err = { error: "Name is required" };
    logConsole(req, err);
    return res.status(400).json(err);
  }
  const out = { msg: `Hello, ${name.toUpperCase()} from POST!` };
  logConsole(req, out);
  res.status(200).json(out);
});

// ROTAS - VERSÃO 2 (v2 - Suporte a Idiomas)

app.get('/v2/hi/:lang', (req, res) => {
  const lang = (req.params.lang || 'en').toLowerCase();
  const texto = saudacoes[lang] || saudacoes['en'];
  
  const out = { msg: `${texto}, world!` };
  logConsole(req, out);
  res.status(200).json(out);
});

// GET /v2/hi/user/:lang/:name 
app.get('/v2/hi/user/:lang/:name', (req, res) => {
  const lang = (req.params.lang || 'en').toLowerCase();
  const texto = saudacoes[lang] || saudacoes['en'];
  
  const out = { msg: `${texto}, ${req.params.name}` };
  logConsole(req, out);
  res.status(200).json(out);
});

app.post('/v2/hi', (req, res) => {
  const { name, lang } = req.body;
  
  if (!name) {
    const err = { error: "Name is required" };
    logConsole(req, err);
    return res.status(400).json(err);
  }

  const idiomaSelecionado = (lang || 'en').toLowerCase();
  const texto = saudacoes[idiomaSelecionado] || saudacoes['en'];

  const out = { msg: `${texto}, ${name.toUpperCase()} from POST!` };
  logConsole(req, out);
  res.status(200).json(out);
});

app.use((req, res) => {
  const err = { error: 'Invalid endpoint' };
  logConsole(req, err);
  res.status(404).json(err);
});

app.listen(PORT, () => {
  console.log(`Servidor a executar com v1 e v2 em http://localhost:${PORT}`);
});
