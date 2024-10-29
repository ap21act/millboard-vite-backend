import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './database/index.js';

dotenv.config({
    path: './.env'
});
const port=process.env.PORT || 5000;
connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server running on port ${port}`);
    })
})
.catch((error)=>{
    console.log("Server failed to start: ", error);
})


