const mongoose = require("mongoose");

const counterGstSchema = new mongoose.Schema({

counterGstPercentage:{
    type: Number,
    required: true,
    unique:true,
    min: 0,
    max: 100,
}
})

const CounterGst = mongoose.model("CounterGst" , counterGstSchema)

module.exports = CounterGst;