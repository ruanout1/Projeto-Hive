// =====================================
// HELPER: Tratamento de Erros Centralizado
// =====================================
// Esta é a função que todos os controllers podem importar
// para padronizar as respostas de erro.

exports.handleDatabaseError = (res, error, operation) => {
  console.error(`Erro ao ${operation}:`, error);

  // Erro de Validação do Sequelize (ex: campo obrigatório faltando)
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Dados de entrada inválidos',
      details: error.errors.map((err) => err.message),
    });
  }
  
  // Erro de Restrição Única (ex: e-mail ou CNPJ já existe)
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.fields ? Object.keys(error.fields)[0] : 'dados';
    const value = error.fields ? error.fields[field] : 'desconhecido';
    return res.status(400).json({ message: `Já existe um registro com ${field} = ${value}.` });
  }

  // Erro de Chave Estrangeira (ex: tentando ligar a um 'client_id' que não existe)
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ message: 'Erro de referência: um dos IDs fornecidos não existe.' });
  }

  // Erro genérico (ex: falha de conexão, erro de sintaxe SQL)
  res.status(500).json({
    message: `Erro interno do servidor ao ${operation}`,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};