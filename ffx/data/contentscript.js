var html = document.body.innerHTML;
var pbtitles = '';
var ftcount = 0;
var pattern = '';
var repl = '';

function getOffsetRect(elem) {
  // (1)
  var box = elem.getBoundingClientRect()
  
  var body = document.body
  var docElem = document.documentElement
  
  // (2)
  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
  
  // (3)
  var clientTop = docElem.clientTop || body.clientTop || 0
  var clientLeft = docElem.clientLeft || body.clientLeft || 0
  
  // (4)
  var top  = box.top +  scrollTop - clientTop
  var left = box.left + scrollLeft - clientLeft
  
  return { top: Math.round(top), left: Math.round(left) }
}

self.port.emit('sendHTML', html);

self.port.on('updateHTML', function(changes) {
  if(changes) {

    // Add style information for highlighted titles and popups
    var style = document.createElement('style');
    var css = ".pbtitle { background-color: yellow } .pbpopup { display:none; position:absolute; top:-20px; z-index:999; max-width:500px; background-color:#eee; padding:10px; border:1px solid #999; border-radius:5px; font-size:14px; font-weight:normal; color:#333; white-space: normal; font-family: 'Open-sans', sans-serif;} .pbpopop a, .pbpopup a:visited, .pbpopup a:link { color:#1a0dab; }";

    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // Function that goes through the document tree performing the find and replace on powerbase title keywords

    function highlightTitle(title, i) {
      console.log('nativeTreeWalker called');
      var walker = document.createTreeWalker(
          document.body, 
          NodeFilter.SHOW_TEXT, 
          null, 
          false
      );

      var node;
      var textNodes = [];

      while(node = walker.nextNode()) {
        console.log('nextnode');
          // Could possibly exclude things like scripts / style here

          /* If the value of the text node matches the title and it is visible in the document, add it to the array */

          if(node.nodeValue && pattern.test(node.nodeValue) && node.parentElement.offsetWidth != 0) {
            console.log('node matches');
            console.log(node);

            var c = 'pbtitle' + i;
            repl = "<span class='" + c + "'>" + title + "</span>";
            textNodes.push(node);
          }
      }
      console.log('doreplace');
      var c = 'pbtitle' + 1;
      repl = "<span class='" + c + "'>" + title + "</span>";

      // For each found textnode replace it with an element containing the original text with the title keyword highlighted

      textNodes.forEach(function(textNode) {
        console.log(textNode);
        var newSpan = document.createElement('span');
        // But what if it occurs multi times?
        var splitVal = textNode.nodeValue.split(title);
        var tnBefore = document.createTextNode(splitVal[0]);
        var tnAfter = document.createTextNode(splitVal[1]);
        var highlight = document.createElement('span');
        highlight.className = 'pbtitle';
        highlight.textContent = title;
        highlight.addEventListener('mouseenter', function(e) {
          var rect = getOffsetRect(highlight);
          console.log('highlightel coords: ' + rect.top + ', ' + rect.left);
          // console.log(e);
          // console.log(e.clientY);
          // console.log(e.clientX);
          var popup = document.getElementById('pbpopup' + i);
          popup.style.position = 'absolute';
          // popup.style.top = e.clientY + 'px';
          // popup.style.left = e.clientX + 'px';
          popup.style.top = rect.top + 'px';
          popup.style.left = rect.left + 'px';
          popup.style.display = 'block';
        });
        if(tnBefore) newSpan.appendChild(tnBefore);
        newSpan.appendChild(highlight);
        if(tnAfter) newSpan.appendChild(tnAfter);

        textNode.parentNode.replaceChild(newSpan, textNode)
      })
      console.log('done');
    }

    var i = 1;

    for(change in changes) {
      var title = changes[change].title;
      var link = changes[change].link;
      var excerpt = changes[change].excerpt;
      var word_count = changes[change].word_count;

      pattern = new RegExp('\\b' + title + '\\b', 'g');
        //var pattern = /\b + title + \b/g,
      //repl = "<span class='pb pbtitle'>" + title + "</span>" + "<div class='pb pbpopup'><p><a href='" + link + "' target='_blank'>" + title + " Powerbase page</a></p><p>" + excerpt + "</p><p>" + word_count + " words</p></div>";

      console.log('make change')
      console.log(title)
      console.log(link)
      console.log(excerpt)
      console.log(word_count)
      console.log("\n")

      /* Create the popup div (hidden by default) and append it to the body */

      var popup = document.createElement('div');
      popup.id = 'pbpopup' + i;
      popup.className = 'pbpopup';

      var link_p = document.createElement('p');
      var link_a = document.createElement('a');
      link_a.href = link;
      link_a.target = '_blank';
      link_a.innerHTML = title + ' Powerbase page';
      link_p.appendChild(link_a);
      popup.appendChild(link_p);

      var excerpt_p = document.createElement('p');
      excerpt_p.innerHTML = excerpt;
      popup.appendChild(excerpt_p);

      var word_count_p = document.createElement('p');
      word_count_p.innerHTML = word_count + ' words';
      popup.appendChild(word_count_p);


      document.body.appendChild(popup);

      popup.addEventListener('mouseleave', function(e) {
        console.log('mouseleave popup');
        //console.log(popup);
        console.log(e);
        console.log(e.target);
        //var popup = document.getElementById('pbpopup' + i);
        e.target.style.display = 'none';
      });

      highlightTitle(title, i);
      console.log("findtitles finished. Moving to next change\n");

      i++;
    };
  };
  self.port.emit('finishedUpdating');
});
