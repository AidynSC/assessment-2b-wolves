const mongoose = require('mongoose');
const { userSchema } = require('./users');
const potluckSchema = new mongoose.Schema({
    name: {type: String, required: true},
    location: {type: String, required: true},
    date: {type: Date, required: true},
    host: userSchema
});

module.exports = mongoose.model('Potluck', potluckSchema);
