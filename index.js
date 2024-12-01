const express = require('express');
const dotenv = require('dotenv'); 
dotenv.config(); 

const app = express();


app.use(express.json()); 

const authRouter = require('./src/routes/auth.route');

app.use('/api/auth', authRouter)

const PORT = process.env.PORT || 3000;  
app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT}`);
});

module.exports=  app;