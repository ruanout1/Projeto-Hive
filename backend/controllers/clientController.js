const Servico = require('../models/Servico');

// Dados estáticos (mantidos para apresentação)
const servicosEstaticos = [
  { id: 1, titulo: 'Limpeza Geral - Escritório Corporate', cliente: 'Carlos Silva', status: 'em-andamento', equipe: 'Equipe Alpha', dataInicio: '2024-09-23' },
  { id: 2, titulo: 'Limpeza Pós-Obra - Loja Centro', cliente: 'Maria Souza', status: 'concluído', equipe: 'Equipe Beta', dataInicio: '2024-09-20' },
];

// Listar serviços (banco + estáticos)
exports.getServicos = async (req, res) => {
  try {
    const servicosDB = await Servico.findAll();
    const todosServicos = [...servicosEstaticos, ...servicosDB];
    res.json(todosServicos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar serviços.' });
  }
};

// Criar novo serviço (dinâmico)
exports.createServico = async (req, res) => {
  try {
    const novoServico = await Servico.create(req.body);
    res.status(201).json(novoServico);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar serviço.' });
  }
};
