const express = require('express');
const app = express();
const PORT = 8000;

// Middleware para processar dados de formulários
app.use(express.urlencoded({ extended: true }));

// Função para exibir o log no console: [data/hora] | Endpoint | Saída
function logConsole(req, dataOutput) {
  const dataHora = new Date().toLocaleString('pt-BR');
  const endpoint = req.originalUrl || req.url;
  console.log(`[${dataHora}] | Endpoint: ${endpoint} | Saída: ${JSON.stringify(dataOutput)}`);
}

// Rota GET /v1/hi
app.get('/v1/hi', (req, res) => {
  const out = { msg: "Hello, world!" };
  logConsole(req, out);
  res.status(200).json(out);
});

// Rota GET com parâmetro /v1/hi/user/:name
app.get('/v1/hi/user/:name', (req, res) => {
  const out = { msg: "Hello, " + req.params.name };
  logConsole(req, out);
  res.status(200).json(out);
});

// Rota POST /v1/hi
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

// Tratamento de endpoints inexistentes (Erro 404)
app.use((req, res) => {
  const err = { error: 'Invalid endpoint' };
  logConsole(req, err);
  res.status(404).json(err);
});

app.listen(PORT, () => {
  console.log(`Exercício 1 executando em http://localhost:${PORT}`);
});