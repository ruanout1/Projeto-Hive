// Teste rápido do db.js
const db = require('./database/db');

console.log('\n=== Testando db.js ===\n');

console.log('✅ sequelize:', !!db.sequelize);
console.log('✅ models:', !!db.models);
console.log('\n📦 Models exportados por models:', Object.keys(db.models).sort().join(', '));

console.log('\n📦 Aliases disponíveis:');
console.log('  User:', !!db.User);
console.log('  Company:', !!db.Company);
console.log('  ClientUser:', !!db.ClientUser);
console.log('  Team:', !!db.Team);
console.log('  ServiceRequest:', !!db.ServiceRequest);

console.log('\n✅ db.js carregado com sucesso!\n');
