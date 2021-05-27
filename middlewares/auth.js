exports.isAuthenticated = (req,res,next)=>{
    if(!req.session.candidate &&  !req.session.recruiter)
        return res.status(401).send("User not Authorized");
    next();
};

exports.isCandidate = (req,res,next)=>{
    if(!req.session.candidate) 
        return res.status(405).send("User not Allowed");
    next();
};

exports.isRecruiter = (req,res,next)=>{
    if(!req.session.recruiter)
        return res.status(405).send("User not Allowed");
    next();
};


