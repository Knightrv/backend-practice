const mongoose = require('mongoose');
const { Schema } = mongoose;
const jobSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 60,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 2000,
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: "Recruiter",
    },
    vacancies : {
        type: Number,
        required : true,
    },
    applicants : [{
        status: String,
        postedBy:{
            type:Schema.Types.ObjectId,
            ref:"Candidate"
        }
    }],
    status: {
        type:String,
        default: "OPEN",
    },
},
    {timestamps: true},
);


module.exports = mongoose.model("Job", jobSchema);