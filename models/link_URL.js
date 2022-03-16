const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema ({
    _id: {
        type: String,
        required: true
    },
    URL: {
        type: String
    }
})
module.exports = mongoose.model('Link_URL',userSchema);