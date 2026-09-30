'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const port = Number.parseInt(process.env.PORT || '10000', 10);
const indexPath = path.join(__dirname, 'index.html');
const previewHost = (process.env.AMAZI_PREVIEW_HOST || '').toLowerCase();

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port.');
}

function requestHostname(request) {
  try {
    return new URL(`http://${request.headers.host || ''}`).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isAllowedDevelopmentHost(hostname) {
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '[::1]'
    || (previewHost !== '' && hostname === previewHost);
}

const server = http.createServer((request, response) => {
  const hostname = requestHostname(request);
  if (process.env.NODE_ENV !== 'production' && !isAllowedDevelopmentHost(hostname)) {
    response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  let pathname;
  try {
    pathname = new URL(request.url || '/', 'http://localhost').pathname;
  } catch {
    response.writeHead(400);
    response.end('Bad Request');
    return;
  }

  if (pathname === '/health') {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('ok');
    return;
  }

  if (pathname !== '/' && pathname !== '/index.html') {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' });
    response.end();
    return;
  }

  fs.readFile(indexPath, (error, contents) => {
    if (error) {
      response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Unable to read the application page.');
      return;
    }

    response.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'content-length': contents.length,
      'x-content-type-options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : contents);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Night map app listening on 0.0.0.0:${port}`);
});
