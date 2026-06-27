const mongoose = require('mongoose');

const logsSchema = mongoose.Schema({
    logId: {
        type: Number,
        require: true
    },
    ts: {
        type: Date,
        require: true,
        default: new Date()//.getTime()
    },
    etemperatura: {
        type: Number,
    },
    nodoId: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model('Logs', logsSchema);
