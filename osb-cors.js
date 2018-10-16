//
// How to use:
//
// 1. Start node:
//    node nodeproxy.js
// 2. Send a URL like this:
//    http://localhost:8080/http://www.google.com
//
// Watch www.google.com come through your local HTTP proxy.
//
// What is this useful for?
// Cross-domain Ajax requests can be rewritten so that they are routed through the local proxy, this can be easily
// done in your JS code by wrapping them in a function that checks if we're developing locally and if so include
// http://localhost:8080 in front of the URL. You can also extend the prototype of the String class:
//
//  String.prototype. = function() {
//    if(runningLocally) {
//      return("http://localhost:8080" + this);
//    }
//     else {
//      return(this);
//    }
//  }
//
//  ...
//  $.ajax("http://yoursevice/ajax/request".prx, ...)
//

require('dotenv').config();
const http = require('http');

http.createServer(function (request, response) {
	
	const protocol = process.env.protocol;
	const server = process.env.server;
	const port = process.env.port;

	target = protocol + '://' + server + ':' + port + request.url;

	if (target[0] == "/") // remove the leading forward slash
		target = target.substring(1, target.length);

	console.log("Request received. Target: " + target);

	var options = {
		host: server,
		path: request.url,
		//since we are listening on a custom port, we need to specify it by hand
		port: port,
		//This is what changes the request to a POST request
		method: request.method,
		headers: request.headers
	};

	callback = function (proxyResponse) {
		proxyResponse.on('data', function (chunk) {
			response.write(chunk);
			// serviceResponse
		});
		proxyResponse.on('end', function () {
			response.end();
			// serviceResponse
		});
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		response.setHeader('Access-Control-Allow-Methods', '*'); 
	}

	var req = http.request(options, callback);
	//This is the data we are posting, it needs to be a string or a buffer
	let body = [];
	request.on('data', (chunk) => {
		body.push(chunk);
	}).on('end', () => {
		body = Buffer.concat(body).toString();
		// at this point, `body` has the entire request body stored in it as a string
		req.write(body);
		req.end();
	});
	
	
/*	
	// parse the url
	url_parts = url.parse(target);
	if (url_parts.host == undefined) { // stop processing, URL must contain http(s)://
		response.write("ERROR: missing host in target URL " + target);
		response.end();
	} else {

		var aux = url_parts.host.split(':');
		var remoteServer = aux[0];
		var port = aux[1];

		url_parts.host = remoteServer;
		console.log(url_parts.host);
		var proxy = http.createClient(port, url_parts.host);

		if (protocol == 'https') {
			proxy = https;
		}

		var proxy_request = proxy.request(request.method, url_parts.href, request.headers);

		console.log("Creating proxy request to server: " + url_parts.hostname + ", path: " + url_parts.pathname);

		proxy_request.addListener('response', function (proxy_response) {
			proxy_response.addListener('data', function (chunk) {
				response.write(chunk, 'binary');
			});
			proxy_response.addListener('end', function () {
				response.end();
			});
			proxy_response.headers['Access-Control-Allow-Origin'] = '*';
			proxy_response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';

			response.writeHead(proxy_response.statusCode, proxy_response.headers);
		});
		request.addListener('data', function (chunk) {
			proxy_request.write(chunk, 'binary');
		});
		request.addListener('end', function () {
			proxy_request.end();
		});
	}
*/
}).listen(3000);
console.log("Proxy started. Listening to port 3000");
