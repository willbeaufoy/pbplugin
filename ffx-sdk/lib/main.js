var ss = require('sdk/simple-storage');
ss.storage.pages = ['Andrew White','Piers Benn','Strategic Studies Institute','Tom (MI6 officer)','D-Notice','Flash','1001 Club','Pall Mall','106 Pall Mall','10International'];

var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Visit Mozilla",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  // tabs.open("http://www.mozilla.org/");
  // content = 'document.body.innerHTML = "' + ss.storage.pages[0] + '";';
  worker = tabs.activeTab.attach({
    contentScriptFile: self.data.url('get_html.js')
  });
  worker.port.on('sendHTML', function(html) {
    var newhtml = html.replace(/she/i, 'pussy');
    worker.port.emit('sendNewHTML', newhtml);
  });
};