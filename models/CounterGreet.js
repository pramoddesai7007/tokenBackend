const mongoose = require('mongoose');

const counterGreetSchema = new mongoose.Schema({
  greet: {
    type: String,
   
  },
  message: {
    type: String,

  }
 
});

const CounterGreet = mongoose.model('CounterGreet', counterGreetSchema);

module.exports = CounterGreet;