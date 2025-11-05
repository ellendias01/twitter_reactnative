require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de logging para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.method === 'POST' && req.body) {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
  });
}

// Rota de saúde/status
app.get('/', (req, res) => {
  res.json({
    status: 'Servidor rodando',
    message: 'API de Analytics funcionando corretamente',
    version: '1.0.0',
    endpoints: {
      analytics: '/api/analytics',
      health: '/api/health'
    }
  });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI não definida no arquivo .env');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DATABASE_NAME || 'analytics'
    });
    
    console.log('✅ MongoDB conectado com sucesso');
    console.log(`📦 Banco de dados: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    console.error('💡 Verifique o arquivo .env e as credenciais do MongoDB');
    // O servidor continua rodando mesmo se MongoDB falhar (para desenvolvimento)
  }
};

// Eventos de conexão MongoDB
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose conectado ao MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro na conexão MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose desconectado do MongoDB');
});

// Rotas da API
app.use('/api/analytics', analyticsRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    
    // Escutar em 0.0.0.0 para aceitar conexões de outros dispositivos na rede
    const HOST = process.env.HOST || '0.0.0.0';
    
    app.listen(PORT, HOST, () => {
      console.log('🚀 Servidor rodando!');
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`🌐 Rede: http://${HOST === '0.0.0.0' ? 'seu-ip' : HOST}:${PORT}`);
      console.log(`📡 Endpoint de analytics: http://localhost:${PORT}/api/analytics`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n💡 Para conectar do dispositivo:`);
      console.log(`   1. Descubra seu IP atual: ipconfig (Windows) ou ifconfig (Mac/Linux)`);
      console.log(`   2. Atualize o IP no arquivo config/api.ts`);
      console.log(`   3. Use: http://seu-ip-atual:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Erro não tratado:', err);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  await mongoose.connection.close();
  process.exit(0);
});

// Iniciar aplicação
startServer();

