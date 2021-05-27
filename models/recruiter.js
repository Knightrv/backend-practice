const mongoose = require('mongoose');
const { Schema } = mongoose;

const recruiterSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        unique: true,
    },
    password : {
        type:String,
        required: true,
        maxlength:100,
    }
},
    {timestamps: true},
);


module.exports = mongoose.model("Recruiter", recruiterSchema);