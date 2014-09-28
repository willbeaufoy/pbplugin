var html = document.body.innerHTML;

self.port.emit('sendHTML', html);

self.port.on('updateHTML', function(changes) {
  var newhtml = html;
  console.log('changes:');
  console.log(changes);
  for(change in changes) {
    console.log('change:');
    console.log(change);
    console.log('changes[change].title');
    console.log(changes[change].title);
    // Need to replace only visible text.
    // Use .text() selector and do replace on this
    // Cannot do $('body').text($('body').text().replace('orig', 'new')) as removed all but text
    // So need to 
    // Using contains. Then need to get only those that don't contain other contains elements

    // Get all elements that contain title. 
    var elems = $(':contains(' + changes[change].title + ')');
    // Filter these by excluding all elements that contain another element with title (ie. parent elements like body)
    var replaceElems = [];
    $.each(elems, function(index, value) {
      var unique = true;
      $.each(elems, function(subindex, subvalue) {
        if($.contains(value, subvalue)) {
          unique = false;
        }
      });
      console.log(value);
      console.log(unique);
      if(unique == true) {
        replaceElems.push(value);
      }
    });
    // Update the text in these filtered elements
    //newhtml = newhtml.replace(changes[change].title, "<span style='background-color: yellow>" + changes[change].title + "</span>");
    $.each(replaceElems, function(index, value) {
      console.log('value');
      console.log(value);
      //value.text(value.text.replace('Bundle','Asshole'))
      var replacehtml = value.innerHTML.replace(changes[change].title, "<span style='background-color: yellow'>" + changes[change].title + "</span>");
      console.log('replacehtml')
      console.log(replacehtml)
      value.innerHTML = replacehtml
    })
  }
  //document.body.innerHTML = newhtml;
});
