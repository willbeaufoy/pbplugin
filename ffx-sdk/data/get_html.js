var html = document.body.html;

self.port.emit('sendHTML', html);

self.port.on('sendNewHTML', function(newhtml) {
  document.body.innerHTML = newhtml;
});