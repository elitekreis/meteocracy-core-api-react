const http = require('http');
const app = require('./app');
const bodyParser = require("body-parser");
const port = process.env.PORT || 4000;
const server = http.createServer(app);

server.listen(port, () => {
    console.log('Server is running at port ' + port);
});
