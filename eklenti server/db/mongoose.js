const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb+srv://furkan:O6n9c2e7*@czmcluster.0h9u0ui.mongodb.net/birthdayreminderdb', {
//mongoose.connect('mongodb://localhost:27017/testapii', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}) .then(()=>{
    console.log("Connected to MongoDB succesfully :)");
    }) .catch((e) =>{

        console.log("Error while connecting to MongoDB :(");
        console.log(e);
    });

    module.exports = {
        mongoose
    };