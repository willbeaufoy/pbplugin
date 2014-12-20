var prefs = {'autorun': false};
var keepSpinningIcon = false;
var spinningIconFrames = ['powerbase-logo-19.png', 'powerbase-logo-19-rotated.png']

function getPrefs() {
  console.log('getPrefs ran');
  chrome.storage.sync.get({
    'autorun': false,
  }, function(items) {
    prefs.autorun = items.autorun;
  });
}

getPrefs();

chrome.storage.onChanged.addListener(function(changes, areaName) {
  for(change in changes) {
    prefs[change] = changes[change].newValue;
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, info) {
  if(info.status == 'complete') {
  // If plugin is on and tab is a web page set up the app
    console.log('Tab ready');
    if(prefs.autorun) {
      console.log('autorun is true, calling highlighttitles');
      highlightTitles();
    }
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('message received by background.js');
  if(request == "highlightTitles") {
    highlightTitles();
  }
  else if(request == "requestFailed") {
    keepSpinningIcon = false;
  }
  else if(request == "noTitlesFound") {
    keepSpinningIcon = false;
  }
  else if(request == "titlesHighlighted") {
    keepSpinningIcon = false;
  }
  else if(request == "httpsSite") {
    keepSpinningIcon = false;
  }
});

function highlightTitles() {
  console.log('highlightTitles called from background.js');
  keepSpinningIcon = true;
  startIconSpinning();
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {'message': 'highlightTitles'});
  });
}

function startIconSpinning() {
  console.log('startIconSpinning called');
  var i = 1;
  function spinIcon() {
    if(keepSpinningIcon == true) {
      console.log('keepSpinningIcon is still false - continueing spinning')
      chrome.browserAction.setIcon({
        path: spinningIconFrames[i]
      });
      i = (i + 1) % spinningIconFrames.length;
      console.log(i);
      setTimeout(spinIcon, 150);
    }
    else {
      console.log('keepSpinningIcon is now true - stopping spinning')
      chrome.browserAction.setIcon({
        path: "powerbase-logo-19.png"
      });
    }
  }
  spinIcon();
}
