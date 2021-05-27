const express = require('express');
const router = express.Router();
const Recruiter = require('../models/recruiter');
const Candidate  = require('../models/candidate');
const bcrypt = require('bcryptjs');
var ObjectId = require('mongodb').ObjectId; 
const Job = require('../models/job');
const bodyParser = require('body-parser');
const {registerValidate,loginValidate}  = require('../validators/userValidator');
const {jobValidate} = require('../validators/jobValidator');
const { isAuthenticated, isCandidate} = require('../middlewares/auth');
const { route } = require('./recruiter');



router.post('/register',async (req,res)=>{
    const {error}=registerValidate(req.body);
    if(error){
        return res.status(422).send(error.details[0].message);
    }

    const user1 = await Candidate.findOne({email:req.body.email});
    const user2 = await Recruiter.findOne({email:req.body.email});

    if(user1 || user2)
        return res.status(409).send("Email already occupied");
    
    const {name,email,password} = req.body;

    bcrypt.hash(password,10,(err,hash)=>{
        if(err)
            return res.status(422).send("Not able to save in database");
        const newCandidate = new Candidate({
            name,
            email,
            password:hash
        });
        newCandidate.save((error,savedUser)=>{
            if(err)
                return res.status(422).send("Not able to save in database");
            console.log(savedUser);
            res.send(savedUser);
        })
    })

});


router.post('/login',(req,res)=>{
    const {error}=loginValidate(req.body);
    if(error){
        return res.status(422).send(error.details[0].message);
    }
    console.log(req.session.candidate);
    Candidate.findOne({email:req.body.email},(err,user)=>{
        if(err)
            return res.status(403).send("Incorrect email or password !!");
        bcrypt.compare(req.body.password,user.password,(error,result)=>{
            if(!result){
                return res.status(403).send("Incorrect email or password");
                
            }else{
                req.session.candidate=user;
                res.send(user);
            }
        });
    });
});


router.put('/applyJob/:jobid',isAuthenticated,isCandidate,(req,res)=>{
    const {jobid}=req.params;
    console.log(jobid);
    const application ={
        status:"APPLIED",
        postedBy:new ObjectId(req.session.candidate._id)
    };
    console.log(application);
    Job.findOneAndUpdate({_id:jobid},{$push:{applicants:application}},{new:true,useFindAndModify:false}).populate('applicants').exec((err,data)=>{
        if(err)
            return res.status(422).send("Unable to apply");
        res.send(data);
    });
});

router.get('/appliedjobs',isAuthenticated,isCandidate,(req,res)=>{
    Job.find({'applicants.postedBy':new ObjectId(req.session.candidate._id)},((err,data)=>{
        if(err)
            return res.status(422).send("Unable to fectch jobs");
        res.send(data);
    }));
});

router.put('/removeJob/:jobid',isAuthenticated,isCandidate,(req,res)=>{
    const {jobid}=req.params;
    Job.findOneAndUpdate({_id:jobid},{$pull:{applicants:{postedBy:new ObjectId(req.session.candidate._id)}}},{new:true,useFindAndModify:false},(err,data)=>{
        if(err)
            return res.status(422).send("unable to remove job");
        res.send(data);
    });
});

module.exports = router;