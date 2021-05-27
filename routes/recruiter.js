const express = require('express');
const router = express.Router();
const Recruiter = require('../models/recruiter');
const Candidate  = require('../models/candidate');
const Job = require('../models/job');
var ObjectId = require('mongodb').ObjectId; 
const bodyParser=require('body-parser') 
const bcrypt = require('bcryptjs');
const {isAuthenticated,isRecruiter} = require('../middlewares/auth');
const {registerValidate,loginValidate}  = require('../validators/userValidator');
const {jobValidate} = require('../validators/jobValidator');



router.post('/register',async (req,res)=>{
    console.log(req.body);
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
        const newRecruiter = new Recruiter({
            name,
            email,
            password:hash
        });
        newRecruiter.save((error,savedUser)=>{
            if(err)
                return res.status(422).send("Not able to save in database");
            res.send(savedUser);
        })
    })
});


router.post('/login',(req,res)=>{
    const {error}=loginValidate(req.body);
    if(error){
        return res.status(422).send(error.details[0].message);
    }
    Recruiter.findOne({email:req.body.email},(err,user)=>{
        if(err)
            return res.status(403).send("Incorrect username or password !!");
        bcrypt.compare(req.body.password,user.password,(error,result)=>{
            if(result){
                req.session.recruiter=user;
                res.send(user);
            }else{
                return res.status(403).send("Incorrect email or password");
            }
        });
    });
});

router.post('/createJob',isAuthenticated,isRecruiter,(req,res)=>{
    const {error} = jobValidate(req.body);
    if(error){
        return res.status(422).send(error.details[0].message);
    }
    console.log(req.session);
    const newJob = new Job({
        title:req.body.title,
        description:req.body.description,
        vacancies:req.body.vacancies,
        postedBy:new ObjectId(req.session.recruiter._id)
    });
    console.log(newJob);
    newJob.save((err,job)=>{
        if(err)
            return res.status(422).send("Not able to save to database!");
        res.send(job);
    });
});

router.get('/listCandidates/:jobid',isAuthenticated,isRecruiter,(req,res)=>{
    const {jobid}= req.params;
   
    Job.findOne({_id:jobid}).populate('applicants.postedBy').exec((err,data)=>{
        if(err)
            return res.status(422).send("Unable to fetch the applicants !");
        res.send(data.applicants);
    });
});

router.put('/job/:jobId/candidate/:cId/:accept',isAuthenticated,isRecruiter,(req,res)=>{            //accept=0 -> reject application
                                                                                                    // accept =1 -> accept application
    const {jobId,cId,accept}=req.params;
    Job.findOne({_id:jobId}).populate('applicants.postedBy').exec((err,data)=>{
        if(err)
            return res.status(404).send("Job not found!");
        let {applicants,vacancies,status}= data;
        if(accept==1 && applicants.length>0){
            applicants.map((item,index)=>{
                if(item.postedBy.id==cId){
                    item.status="ACCEPTED";
                }
            });
            vacancies=vacancies-1;
            if(vacancies==0)
                status="CLOSED";
        }
        else if(applicants.length>0){
            applicants.map((item,index)=>{
                if(item.postedBy.id==cId){
                    item.status="REJECTED";
                }
            });
        }
        Job.updateOne({_id:jobId},{$set:{vacancies:vacancies,status:status,applicants:applicants}},{new:true,useFindAndModify:false}).populate('applicants.postedBy').exec((err,result)=>{
            if(err)
                return res.status(422).send("unable to update data");
            res.send(result);
        });
    });
});

module.exports = router;