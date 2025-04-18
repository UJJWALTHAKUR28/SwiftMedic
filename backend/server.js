const http = require('http');
const app = require('./App');
const Port = process.env.Port|| 3000;
const server= http.createServer(app);
server.listen(Port,()=>{
    console.log(`Server is running on port ${Port}`);
});