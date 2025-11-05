const express = require('express');
const router = express.Router();
const AnalyticsEvent = require('../models/AnalyticsEvent');

/**
 * POST /api/analytics
 * Recebe e salva um evento de analytics
 */
router.post('/', async (req, res) => {
  try {
    console.log('📥 Recebendo evento individual...');
    console.log('Body recebido:', JSON.stringify(req.body, null, 2));
    
    const { type, message, metadata, screenName, variant, buttonName, renderTime, timestamp } = req.body;

    // Validação básica
    if (!type) {
      return res.status(400).json({
        error: 'Campo obrigatório faltando',
        required: ['type'],
        received: Object.keys(req.body)
      });
    }

    // Validar tipo de evento
    const validTypes = ['SCREEN_VIEW', 'BUTTON_CLICK', 'RENDER_TIME'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Tipo de evento inválido',
        received: type,
        validTypes
      });
    }

    // Criar mensagem se não fornecida
    let finalMessage = message;
    if (!finalMessage) {
      if (type === 'SCREEN_VIEW' && screenName) {
        finalMessage = `Screen View: ${screenName}${variant ? ` (Variant ${variant})` : ''}`;
      } else if (type === 'BUTTON_CLICK' && buttonName) {
        finalMessage = `Button Click: ${buttonName}${screenName ? ` on ${screenName}` : ''}`;
      } else if (type === 'RENDER_TIME' && screenName) {
        finalMessage = `Render Time: ${screenName}${renderTime ? ` - ${renderTime}ms` : ''}`;
      } else {
        finalMessage = `Event: ${type}`;
      }
    }

    // Criar evento
    const event = new AnalyticsEvent({
      type,
      message: finalMessage,
      metadata: metadata || {},
      screenName,
      variant,
      buttonName,
      renderTime,
      timestamp: timestamp || Date.now()
    });

    // Validar antes de salvar
    const validationError = event.validateSync();
    if (validationError) {
      return res.status(400).json({
        error: 'Erro de validação',
        details: validationError.errors
      });
    }

    // Salvar no banco
    console.log(`💾 Salvando evento no banco de dados...`);
    const savedEvent = await event.save();
    console.log(`✅ Evento salvo com sucesso! ID: ${savedEvent._id}`);

    res.status(201).json({
      success: true,
      event: savedEvent
    });
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Erro de validação',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Erro ao salvar evento de analytics',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/analytics/batch
 * Recebe e salva múltiplos eventos de analytics
 */
router.post('/batch', async (req, res) => {
  try {
    console.log('📥 Recebendo batch de eventos...');
    console.log('Body recebido:', JSON.stringify(req.body, null, 2));
    
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      console.error('❌ Array de eventos inválido ou vazio');
      return res.status(400).json({
        error: 'Array de eventos é obrigatório',
        received: typeof events
      });
    }

    console.log(`✅ Recebidos ${events.length} eventos para processar`);

    // Validar tipos antes de processar
    const validTypes = ['SCREEN_VIEW', 'BUTTON_CLICK', 'RENDER_TIME'];
    const invalidEvents = events.filter(e => !e.type || !validTypes.includes(e.type));
    
    if (invalidEvents.length > 0) {
      return res.status(400).json({
        error: 'Alguns eventos têm tipo inválido',
        invalidCount: invalidEvents.length,
        validTypes
      });
    }

    // Validar e preparar eventos
    const validEvents = events.map(event => {
      if (!event.message) {
        // Criar mensagem padrão se não fornecida
        let message = `Event: ${event.type}`;
        if (event.type === 'SCREEN_VIEW' && event.screenName) {
          message = `Screen View: ${event.screenName}${event.variant ? ` (Variant ${event.variant})` : ''}`;
        } else if (event.type === 'BUTTON_CLICK' && event.buttonName) {
          message = `Button Click: ${event.buttonName}${event.screenName ? ` on ${event.screenName}` : ''}`;
        } else if (event.type === 'RENDER_TIME' && event.screenName) {
          message = `Render Time: ${event.screenName}${event.renderTime ? ` - ${event.renderTime}ms` : ''}`;
        }
        event.message = message;
      }

      return {
        type: event.type,
        message: event.message,
        metadata: event.metadata || {},
        screenName: event.screenName,
        variant: event.variant,
        buttonName: event.buttonName,
        renderTime: event.renderTime,
        timestamp: event.timestamp || Date.now()
      };
    });

    // Inserir em lote
    console.log(`💾 Salvando ${validEvents.length} eventos no banco de dados...`);
    const savedEvents = await AnalyticsEvent.insertMany(validEvents, {
      ordered: false // Continua inserindo mesmo se alguns falharem
    });

    console.log(`✅ ${savedEvents.length} eventos salvos com sucesso no MongoDB!`);
    console.log(`📊 IDs salvos:`, savedEvents.map(e => e._id));

    res.status(201).json({
      success: true,
      count: savedEvents.length,
      message: `${savedEvents.length} eventos salvos com sucesso`
    });
  } catch (error) {
    console.error('Erro ao salvar eventos em lote:', error);
    
    // Log detalhado do erro
    if (error.writeErrors) {
      console.error('Erros de escrita:', error.writeErrors);
    }
    if (error.errors) {
      console.error('Erros de validação:', error.errors);
    }

    res.status(500).json({
      error: 'Erro ao salvar eventos de analytics',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code
      } : undefined
    });
  }
});

/**
 * GET /api/analytics
 * Lista todos os eventos com paginação e filtros
 */
router.get('/', async (req, res) => {
  try {
    const {
      type,
      screenName,
      variant,
      page = 1,
      limit = 50,
      startDate,
      endDate
    } = req.query;

    // Construir filtro
    const filter = {};
    if (type) filter.type = type;
    if (screenName) filter.screenName = screenName;
    if (variant) filter.variant = variant;

    // Filtro de data
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Buscar eventos
    const events = await AnalyticsEvent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Contar total
    const total = await AnalyticsEvent.countDocuments(filter);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({
      error: 'Erro ao buscar eventos',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/analytics/stats
 * Retorna estatísticas dos eventos
 */
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Estatísticas por tipo
    const statsByType = await AnalyticsEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Estatísticas por tela
    const statsByScreen = await AnalyticsEvent.aggregate([
      { $match: { ...filter, screenName: { $exists: true } } },
      {
        $group: {
          _id: '$screenName',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Estatísticas de variante A/B
    const statsByVariant = await AnalyticsEvent.aggregate([
      { $match: { ...filter, variant: { $exists: true } } },
      {
        $group: {
          _id: '$variant',
          count: { $sum: 1 }
        }
      }
    ]);

    // Tempo médio de renderização
    const avgRenderTime = await AnalyticsEvent.aggregate([
      {
        $match: {
          ...filter,
          type: 'RENDER_TIME',
          renderTime: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRenderTime: { $avg: '$renderTime' }
        }
      }
    ]);

    // Total de eventos
    const totalEvents = await AnalyticsEvent.countDocuments(filter);

    res.json({
      success: true,
      stats: {
        totalEvents,
        byType: statsByType,
        byScreen: statsByScreen,
        byVariant: statsByVariant,
        avgRenderTime: avgRenderTime[0]?.avgRenderTime || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/analytics/:id
 * Busca um evento específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await AnalyticsEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: 'Evento não encontrado'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({
      error: 'Erro ao buscar evento',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

