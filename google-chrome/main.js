var buttons = require('sdk/ui/button/action');
var toggleButtons = require('sdk/ui/button/toggle');
var tabs = chrome.tabs;
var self = require("sdk/self");
var Request = require("sdk/request").Request;
var prefs = require('sdk/simple-prefs').prefs;
var autorun = prefs.autorun;
console.log('autoruninitial: ' + String(autorun))
//require("sdk/tabs").on("ready", logURL);

function onPrefChange(prefName) {
  autorun = prefs.autorun;
  console.log('autorunafterchange: ' + String(autorun))
}

require("sdk/simple-prefs").on("autorun", onPrefChange);

var button = toggleButtons.ToggleButton({
  id: "search-powerbase",
  label: "Search Powerbase",
  icon: {
    "16": "./icon-16.gif",
    "32": "./icon-32.gif",
    "64": "./icon-64.gif"
  },
  onClick: searchPb
});

function stopSpinning() {
  button.state('window', {
    icon: {
    "16": "./icon-16.gif",
    "32": "./icon-32.gif",
    "64": "./icon-64.gif"
    },
  });
}


tabs.on('ready', function(tab) {
  if(autorun) searchPb();
});


function searchPb() {

  // Start icon spinning
  //button.icon['16'] = './icon-spinning-16.gif';
  button.state('window', {
    icon: {
    "16": "./icon-spinning-16.gif",
    "32": "./icon-32.gif",
    "64": "./icon-64.gif"
    },
  });
  console.log('Search started');

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
        console.log(response.status);
        console.log(response.statusText);
        console.log(' Request has completed. json below');
        console.log(response.json);
        if(!response.json) {
          console.log('Server unreachable or error');
          stopSpinning();
        }
        else if(JSON.stringify(response.json) == '{}') {
          console.log('No matches found');
          stopSpinning();
        }
        else {
          worker.port.emit('updateHTML', response.json);
        }
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