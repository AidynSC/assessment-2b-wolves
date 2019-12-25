const mongoose = require('mongoose');

const bringSchema = new mongoose.Schema({
    username: {type: String, required: true},
    bringing: {type: String, required: true},
    potluck: String
});

module.exports = {
    bringSchema,
    Bring: mongoose.model('Bring', bringSchema)
};
