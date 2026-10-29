const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8000;

// Configuração do motor de visualização EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Middlewares para formulários e dados
app.use(express.urlencoded({ extended: true }));

// Função de Log no Console
function logConsole(req, dataOutput) {
  const dataHora = new Date().toLocaleString('pt-BR');
  const endpoint = req.originalUrl || req.url;
  console.log(`[${dataHora}] | Endpoint: ${endpoint} | Saída: ${JSON.stringify(dataOutput)}`);
}

// Tabela de Saudações para a v2
const saudacoes = {
  'pt-br': 'Olá',
  'es': 'Hola',
  'en': 'Hello'
};

// ==========================================
// ROTA PRINCIPAL: Mensagem do Dia 
// ==========================================

app.get('/', async (req, res) => {
  try {
    const ronResponse = await axios.get('https://ron-swanson-quotes.herokuapp.com/v2/quotes');
    const quoteEn = ronResponse.data[0];

    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(quoteEn)}`;
    const transResponse = await axios.get(translateUrl);
    const quotePt = transResponse.data[0][0][0];

    logConsole(req, { quotePt, quoteEn });
    res.render('index', { quotePt, quoteEn, error: null });
  } catch (err) {
    console.error('Erro ao buscar/traduzir citação:', err.message);
    const errObj = { error: 'Não foi possível carregar a mensagem do dia no momento.' };
    logConsole(req, errObj);
    res.render('index', { quotePt: null, quoteEn: null, error: errObj.error });
  }
});

// ==========================================
// ROTAS - VERSÃO 1 (v1)
// ==========================================

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

// ==========================================
// ROTAS - VERSÃO 2 (v2 - Idiomas)
// ==========================================

app.get('/v2/hi/:lang', (req, res) => {
  const lang = (req.params.lang || 'en').toLowerCase();
  const texto = saudacoes[lang] || saudacoes['en'];
  
  const out = { msg: `${texto}, world!` };
  logConsole(req, out);
  res.status(200).json(out);
});

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

// ==========================================
// TRATAMENTO DE ROTAS INEXISTENTES (404)
// ==========================================

app.use((req, res) => {
  const err = { error: 'Invalid endpoint' };
  logConsole(req, err);
  res.status(404).json(err);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});