var http = require("http");
var url = require('url');
var fs = require('fs');
var file = 'pb.db';
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(file)

http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});

  // Get changes to be made and return them to client
  //content = checkPb('Andrew White Flash', 'onComplete');
  // var url_parts = url.parse(request.url, true);
  // var query = url_parts.query;
  // var html = query['body'];

  var html = '';
  request.on('data', function (chunk) {
    html += chunk;
  });
  request.on('end', function () {
    console.log(html);
    // Runs html received from client against database to look for matches
      var changes = {};
      // Check each page in the database for matches in the text
      db.serialize(function() {
        db.each('select * from page', function(err, row) {
          console.log(row);
          if(html.indexOf(row.title) != -1) {
            var change = {title: row.title};
            changes[row.id] = change;
          }
        }, function() {
            console.log(changes);
            console.log(JSON.stringify(changes));
            response.write(JSON.stringify(changes));
            response.end();
        });
      });
  });
}).listen(12345);