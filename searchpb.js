var http = require("http");
var url = require('url');
var fs = require('fs');
var file = 'pb.db';
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(file)

http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});

  var html = '';
  request.on('data', function (chunk) {
    html += chunk;
  });
  request.on('end', function () {
    console.log(html);
    // Runs html received from client against database to look for matches
      var changes = {};
      // Check each page title in the database for matches in the provided html
      db.serialize(function() {
        db.each('select * from page', function(err, row) {
          console.log(row);
          // Only count a match if the title is found in the page as a whole word
          var regex = new RegExp('[^A-Za-z0-9]' + row.title + '[^A-Za-z0-9]');
          if(regex.test(html)) {
            var change = { title: row.title, link: row.link, excerpt: row.excerpt, word_count: row.word_count };
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
}).listen(14590);