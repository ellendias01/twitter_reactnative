const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['SCREEN_VIEW', 'BUTTON_CLICK', 'RENDER_TIME'],
    index: true
  },
  message: {
    type: String,
    required: true
  },
  screenName: {
    type: String,
    index: true
  },
  variant: {
    type: String,
    enum: ['A', 'B']
  },
  buttonName: {
    type: String
  },
  renderTime: {
    type: Number
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Number,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance nas consultas
analyticsEventSchema.index({ type: 1, createdAt: -1 });
analyticsEventSchema.index({ screenName: 1, createdAt: -1 });
analyticsEventSchema.index({ timestamp: -1 });

// Método estático para buscar eventos por tipo
analyticsEventSchema.statics.findByType = function(type) {
  return this.find({ type }).sort({ createdAt: -1 });
};

// Método estático para buscar eventos por tela
analyticsEventSchema.statics.findByScreen = function(screenName) {
  return this.find({ screenName }).sort({ createdAt: -1 });
};

// Método estático para buscar eventos em um período
analyticsEventSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;

