const fs = require('fs');

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;
  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>Enter Msg</title></head>');
    res.write('<body><form action="/message" method="POST"><input type="text" name="myTxt"/><button type="submit">Send</button></form></body>');
    res.write('</html>');
    return res.end();
  }
  
  if (url === '/message' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      console.log("req data event");
      console.log(chunk);
      body.push(chunk);
    });
    return req.on('end', () => {
      console.log("req end event");
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split('=')[1];
      fs.writeFile('message.txt', message, (err) => {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
      });
    });
  }
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>My First Page</title></head>');
  res.write('<body><h1>omg, fxxking trouble</h1></body>');
  res.write('</html>');
  res.end();
}

/* 
module.exports = requestHandler
 */
/* 
module.exports = {
  handler: requestHandler,
  someText: 'my text'
}; 
*/
/* 
module.exports.handler = requestHandler;
module.exports.someText = 'my text';
 */
exports.handler = requestHandler;
exports.someText = 'my text 2';