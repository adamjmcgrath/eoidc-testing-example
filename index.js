const express = require('express');
const http = require('http');
const { auth } = require('express-openid-connect');
const WebSocket = require('ws');

require('dotenv').config();

const app = express();

app.use(auth());

app.get('/', (req, res) => {
  res.send(`
<html>
  <body>
    <div id="hello"></div>
    <script>
      var ws = new WebSocket('ws:localhost:3000/ws');
      ws.onmessage = function (event) {
        document.getElementById('hello').innerText = event.data;
      };    
    </script>
  </body>
</html>
`);
});

const server = app.listen(3000, () => console.log('listening on http://localhost:3000'));

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, _, data) => {
  ws.send('Hi there ' + data.user.sub);
});

server.on('upgrade', async (req, socket, head) => {
  let res = new http.ServerResponse(req);
  res.assignSocket(socket);
  res.on('finish', () => res.socket.destroy());
  app.handle(req, res, () => {
    if (req.oidc.isAuthenticated()) {
      try {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req, { user: req.oidc.user });
        });
      } catch(e) {
        console.log('ERROR', e);
      }
    } else {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });
});
