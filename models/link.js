const mongoose = require('mongoose');
const { update } = require('./user');
const Schema = mongoose.Schema;
const userSchema = new Schema ({
    
    short_url: {
        type: String,
        required: true
    },
    URL: {
        type : String
    },
    email:{
        type : String,
    },
    create_date: {
        type:    Date
    },
    expiry_date:{
        type:   Date
    },
    request_count: {
        type: Number
    } 

})

module.exports = mongoose.model('Link',userSchema);