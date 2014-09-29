var html = document.body.innerHTML;

self.port.emit('sendHTML', html);

self.port.on('updateHTML', function(changes) {
  if(changes) {
    var newhtml = html;

    // Add style information for PB
    var style = document.createElement('style');
    var css = '.pbtitle { background-color: yellow } .pbpopup { display: none; position: absolute; z-index: 999; max-width: 500px; background-color: #fff; padding: 5px; border: 1px solid #999; border-radius: 5px; font-size: 14px; color: #333; }';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    for(change in changes) {
      console.log(change);
      var title = changes[change].title;
      var link = changes[change].link;
      var excerpt = changes[change].excerpt;
      var word_count = changes[change].word_count;

      // Get all elements that contain title as whole word/s.
      var regex = new RegExp('[^A-Za-z0-9]' + title + '[^A-Za-z0-9]', 'g');
      //var regex = new RegExp('\s*' + title + '[\s\,\.]*', 'g');
      //var regex = new RegExp('[^\S]' + title + '[\s\,\.]*', 'g');
      var elems = $('body').filter(function() {
        return regex.test($(this).text());
      });

      // Filter these by excluding all elements that contain another element with title (ie. parent elements like body)
      var replaceElems = [];
      $.each(elems, function(index, value) {
        var unique = true;
        $.each(elems, function(subindex, subvalue) {
          if($.contains(value, subvalue)) {
            unique = false;
          }
        });
        if(unique == true) {
          replaceElems.push(value);
        }
      });

      // Update the text in these filtered elements
      $.each(replaceElems, function(index, value) {
        console.log(value);
        var replacehtml = value.innerHTML.replace(regex, " <span class='pbtitle'> " + title + "</span><div class='pbpopup'><p><a href='" + link + "'>" +  title + " Powerbase page</a></p><p>" + excerpt + "</p><p>" + word_count + " words</p></div>");
        value.innerHTML = replacehtml
      });
    }
  }
});
