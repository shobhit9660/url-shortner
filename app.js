const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const userRoute = require("./routes/users");
const shortRoute = require("./routes/short");
const cron = require("node-cron");
const Link_URL = require('./models/link_URL');
const Link = require('./models/link');
const Userdetails = require('./models/userdetails');

let url_count1 = new Map();
let url_count2 = new Map();
let curmap=1;

dotenv.config({path: './.env'});

mongoose.connect('mongodb://localhost:27017/URL-Shortner', {
    useNewUrlParser : true,
    useUnifiedTopology : true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});


app.use("/", userRoute);
app.use("/shortner", shortRoute);



async function update_count(){
  curmap=2;
  for (const [key, value] of url_count1.entries()) {
    Link.Update(
      {
        short_url: key  
      },
      {
        $set: {
            count: count+value
        }
      },
      upsert=False,
    )
  }
  url_count1.clear();
  curmap=1;
  for (const [key, value] of url_count2.entries()) {
    Link.Update(
      {
        short_url: key  
      },
      {
        $set: {
            count: count+value
        }
      },
      upsert=False,
    )
  }
  url_count2.clear();
}


async function cleanup(){
    const now = new Date();
    date.format(now, 'YYYY/MM/DD HH:mm:ss');
    const data = await Link.find(
      {'expiry_date': { $lte: now}}
    );
    for (const index in data) 
    {
      Link_URL.deleteOne({_id : data[index].short_url});
      Link.deleteOne({_id : data[index]._id});
      //const ide = data[index]._id;
      //const current = await Userdetails.findByIdAndUpdate(ide,{$pull :{Links : data[index]._id}});
     // const current = await Userdetails.findOne({email});
       
      Userdetails.findOneAndUpdate(
        { email: data[index].email },
        {
            $push: {
                DeadLinks : data[index]
             }
        },
        done
    );
    Userdetails.save();
    Userdetails.findOneAndUpdate(
      { email: data[index].email },
      {
          $pull: {
              Links : data[index]
           }
      },
      done
  );
  Userdetails.save();
    }
}



app.get('/',(req,res) =>{
  res.render("home");
})

app.get('/teeny/:code', async (req, res) => {
    try {
        const url = await Link_URL.findOne({
            _id : req.params.code
        })
          if(curmap==1)
          {
            if (url) {
                if(url_count1.has(req.params.code)){
                const val = url_count1.get(req.params.code);
                url_count1.set(req.params.code,val+1);
            }
            else{
              url_count1.set(req.params.code,1);
            }  
          }
          else
          {
            if (url) {
              if(url_count2.has(req.params.code)){
              const val = url_count2.get(req.params.code);
              url_count2.set(req.params.code,val+1);
          }
          else{
              url_count2.set(req.params.code,1);
          } 
          }
          }
            return res.redirect(url.URL);
        } else {
            return res.status(404).json('No URL Found')
        }
    }
    catch (err) {
        console.error(err)
        res.status(500).json('Server Error')
    }
})

cron.schedule('* * 24 * *', cleanup);
cron.schedule('* * 1 * *', update_count);

app.listen('3000',() =>{
    console.log('Serving on port 3000');
})
