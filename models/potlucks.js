const mongoose = require('mongoose');
const { userSchema } = require('./users');
const { bringSchema } = require('./brings');
const potluckSchema = new mongoose.Schema({
    name: {type: String, required: true},
    location: {type: String, required: true},
    date: {type: Date, required: true},
    host: userSchema,
    followers: Array,
    brings: bringSchema
});

module.exports = mongoose.model('Potluck', potluckSchema);
