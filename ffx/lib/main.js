var buttons = require('sdk/ui/button/action');
var toggleButtons = require('sdk/ui/button/toggle');
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var Request = require("sdk/request").Request;

var button = toggleButtons.ToggleButton({
  id: "check-powerbase",
  label: "Check Powerbase",
  icon: {
    "16": "./icon-16.gif",
    "32": "./icon-32.gif",
    "64": "./icon-64.gif"
  },
  onClick: handleClick
});

function handleClick(state) {

  // Start icon spinning
  //button.icon['16'] = './icon-spinning-16.gif';
  button.state('window', {
    icon: {
    "16": "./icon-spinning-16.gif",
    "32": "./icon-32.gif",
    "64": "./icon-64.gif"
    },
  });
  console.log('button: ' + String(button.icon['16']) + ' clicked');

  worker = tabs.activeTab.attach({
    contentScriptFile: 
      [self.data.url('jquery-1.11.1.min.js'), self.data.url('contentscript.js')]
  });

  worker.port.on('sendHTML', function(html) {
    // var uri = tabs.activeTab.url
    var uri = html;
    //console.log(uri);
    var query = 'http://pb.afnewsagency.org';
    //var query = 'http://localhost:14590';
    //console.log(query);
    var request = Request({
      url: query,
      content: html,
      onComplete: function(response) {
        console.log(' Request has completed. json below');
        console.log(response.json);
        worker.port.emit('updateHTML', response.json);
      }
    }).post();
  });

  worker.port.on('finishedUpdating', function() {
    // Reset button to static state
    console.log('finishedUpdating')
    button.state('window', {
      icon: {
      "16": "./icon-16.gif",
      "32": "./icon-32.gif",
      "64": "./icon-64.gif"
      },
    });
  });
};