require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore =  require('connect-mongo'); 
const app = express();
const PORT = process.env.PORT || 5000;
const candidateRoutes = require('./routes/candidate');
const recruiterRoutes = require('./routes/recruiter');
const job = require('./models/job');

mongoose.connect(process.env.MONGOURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
}).then(
    () => {
        console.log("DB connected");
    }
).catch(() => {
    console.log("Failed to connect to database in backend");
});

const sessionStore = new MongoStore({
    mongoUrl : process.env.MONGOURI,
    collection : "sessions"
});


app.use(express.json());

app.use(session({
    secret : process.env.SESSION_SECRET,
    saveUninitialized:false,
    resave:false,
    name:"sid",
    store:sessionStore,
    cookie:{
        maxAge : 1000*60*60*24,
        sameSite:true,
    }
}));

app.use('/candidate',candidateRoutes);
app.use('/recruiter',recruiterRoutes);

app.post('/logout',(req,res)=>{
    req.destroy(err=>{
        if(err){
            console.log(err);
        }else{
            res.clearCookie('sid');
            res.redirect('/');
        }
    });
});

app.get('/',(req,res)=>{
    job.find({status:"OPEN"},(err,data)=>{
        if(err)
            return res.status(422).send("unable to save data");
        res.send(data);
    });
});


app.listen(PORT,()=>{
    console.log("Server running on "+PORT);
});