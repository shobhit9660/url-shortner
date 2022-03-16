const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Link = require("./link");
const User = require('./user');
const userSchema = new Schema ({
  username : String,
  author: {
  type: Schema.Types.ObjectId,
  ref: "User",
  },
  Links:[
          {
            type: Schema.Types.ObjectId,
            ref: "Link",
          }
    ]
    ,
    DeadLinks:[
      {
        type: Schema.Types.ObjectId,
        ref: "Link",
      }
    ]
})
module.exports = mongoose.model('Userdetails',userSchema);