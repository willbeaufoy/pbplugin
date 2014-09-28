var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var Request = require("sdk/request").Request;

var button = buttons.ActionButton({
  id: "check-powerbase",
  label: "Check Powerbase",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  worker = tabs.activeTab.attach({
    contentScriptFile: 
      [self.data.url('jquery-1.11.1.min.js'), self.data.url('get_html.js')]
  });
  worker.port.on('sendHTML', function(html) {
    // var uri = tabs.activeTab.url
    var uri = html;
    console.log(uri);
    var query = 'http://localhost:12345';
    console.log(query);
    // This is synchrous. I almost certainly want it to be asynchrous 
    var request = Request({
      url: query,
      content: html,
      onComplete: function(response) {
        console.log(response.json);
        worker.port.emit('updateHTML', response.json);
      }
    }).post();
  });
};