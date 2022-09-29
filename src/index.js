const express = require('express')
const route = require("./routes/route")
const mongoose = require('mongoose')
const app = express()

app.use(express.json())

app.use('/',route)

mongoose.connect("mongodb+srv://vaibhav_:DP5cPU2UQSOB14RT@cluster0.27uy03s.mongodb.net/Project4_usrlShortner?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )



app.listen(process.env.port || 3000 , function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});