const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8000;

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', './views');
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

// Chave da API da NASA (Pode usar DEMO_KEY ou sua chave individual)
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

// ==========================================
// ROTA PRINCIPAL: Mensagem do Dia (Aula 17)
// ==========================================

app.get('/', async (req, res) => {
  try {
    // 1. Busca uma frase e autor aleatórios da API ZenQuotes
    const zenResponse = await axios.get('https://zenquotes.io/api/random');
    const quoteEn = zenResponse.data[0].q;
    const author = zenResponse.data[0].a || 'Autor Desconhecido';

    // 2. Traduz a frase para Português
    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(quoteEn)}`;
    const transResponse = await axios.get(translateUrl);
    const quotePt = transResponse.data[0][0][0];

    logConsole(req, { quotePt, quoteEn, author });
    res.render('index', { quotePt, quoteEn, author, error: null });
  } catch (err) {
    console.error('Erro ao buscar/traduzir citação:', err.message);
    const errObj = { error: 'Não foi possível carregar a mensagem do dia no momento.' };
    logConsole(req, errObj);
    res.render('index', { quotePt: null, quoteEn: null, author: null, error: errObj.error });
  }
});

// ==========================================
// ROTA NASA: Exercício Final da Aula 18
// ==========================================

app.get('/nasa', async (req, res) => {
  const astro = (req.query.astro || 'Moon').trim();

  try {
    let images = [];

    // 1. Busca direta na Biblioteca Oficial da NASA (sem limite de requisição e 100% domínio público)
    try {
      const searchUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(astro)}&media_type=image`;
      const searchResponse = await axios.get(searchUrl);
      const items = searchResponse.data.collection.items || [];

      images = items
        .filter(item => item.links && item.links.length > 0)
        .slice(0, 8)
        .map(item => ({
          title: item.data[0]?.title || astro,
          url: item.links[0].href,
          explanation: item.data[0]?.description || 'Imagem oficial do acervo da NASA (Domínio Público).'
        }));
    } catch (e) {
      console.log('Busca primária falhou, tentando APOD...', e.message);
    }

    // 2. Fallback caso a busca acima retorne vazia: consulta a API APOD com lote reduzido (count=10)
    if (images.length === 0) {
      const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&count=10`;
      const apodResponse = await axios.get(apodUrl);

      images = apodResponse.data
        .filter(item => item.media_type === 'image' && !item.copyright)
        .map(item => ({
          title: item.title,
          url: item.url,
          explanation: item.explanation
        }));
    }

    logConsole(req, { astro, totalResultados: images.length });
    res.render('nasa', { astro, images, error: null });

  } catch (err) {
    console.error('Erro na API da NASA:', err.message);
    logConsole(req, { error: err.message });
    res.render('nasa', { 
      astro, 
      images: [], 
      error: 'Não foi possível conectar à API da NASA no momento. Tente novamente em alguns instantes.' 
    });
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