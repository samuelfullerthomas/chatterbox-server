/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var fs = require('fs');
//exports.variable = gottendata

exports.requestHandler = function(request, response) {
  //Request is an instance of the  http.IncomingMessage class, 
  //and has a bunch of methods
  //Response is an instance of the http.ServerResponse class
  //also has a bunch of methods

  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  // The outgoing status.
  // response.end('A get request')
  console.log(request.url)
  console.log(request.method)
  var read = fs.readFileSync('chats.txt');
  var defaultCorsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "contentType, accept, data, Content-Type",
    "access-control-max-age": 10 // Seconds.
    //need to allow all headers, e.g. data.
  };
  var statusCode = 200;
  var gottenData = '';
  var chats = fs.createWriteStream('chats.txt', {'flags': 'a'})
  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  if (request.method === 'GET'){
    if(request.url === '/') {



      response.writeHead(200, {'Content-Type': 'text/html'})
      response.end(fs.readFileSync('client/index.html'))
     } else {
      console.log("Serving request type " + request.method + " for url " + request.url);

      var urlText = request.url
      var typeIndex = urlText.lastIndexOf('.')
      var type = urlText.substring(typeIndex+1)

      //need to create an object/map for type -> correct MIME type
      var typeMap = {js : "text/javascript", html: "text/html", css: "text/css"}

      // Tell the client we are sending them plain text.
      // You will need to change this if you are sending something
      // other than plain text, like JSON or HTML.

      if (request.url === 'chats.txt') {
        headers['Content-Type'] = "text/plain";    
        response.writeHead(statusCode, headers);
        response.end('{ "results" : [' + read.slice(0, read.length-1) + ']}')  
      } else {
        headers['Content-Type'] = typeMap[type];    
        response.writeHead(statusCode, headers);
        console.log('trying ',__dirname+'/client'+request.url)
        var fullUrl = __dirname+'/client'+request.url
        console.log(fullUrl)
        response.end()
      }
    }
  }
  else if (request.method === 'POST'){
    console.log("Serving request type " + request.method + " for url " + request.url);

    // Tell the client we are sending them plain text.
    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    headers['Content-Type'] = "text/plain";
    request.on("data", function(data){
      gottenData += data + ",";
      console.log(gottenData)
    })
    
    request.on('end', function() {
      chats.end(gottenData)
    })
    response.writeHead(statusCode, headers);

    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.
    var read = fs.readFileSync('chats.txt');
    // response.end('{"results" :[' + read.slice(0, read.length-1) + "]}");
    response.end('post')

  }
  else if (request.method === 'OPTIONS') {
    console.log('in options')
    response.writeHead("204", "No Content", {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
      "access-control-allow-headers": "contentType, accept, data, Content-Type",
      "access-control-max-age": 10 // Seconds.
      //need to allow all headers, e.g. data.
    })
    return (response.end())
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.

