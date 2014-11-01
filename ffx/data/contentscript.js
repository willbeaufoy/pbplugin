var html = document.body.innerHTML;
var pbtitles = '';
var ftcount = 0;
var pattern = '';
var repl = '';

self.port.emit('sendHTML', html);

self.port.on('updateHTML', function(changes) {
  if(changes) {
    var newhtml = html;

    // Add style information for PB
    var style = document.createElement('style');
    var css = ".pbtitle { background-color: yellow } .pbpopup { display:none; position:absolute; top:-20px; z-index:999; max-width:500px; background-color:#eee; padding:10px; border:1px solid #999; border-radius:5px; font-size:14px; font-weight:normal; color:#333; white-space: normal; } .pbpopop a, .pbpopup a:visited, .pbpopup a:link { color:#1a0dab; }";

    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // Get all elements that contain title as whole word/s. (This includes both outer (e.g. <html>, <body>), and inner elements)
    //var regex = new RegExp('[^A-Za-z0-9]' + title + '[^A-Za-z0-9]');

    /* jQuery recursive function. Works but slow and sometimes fails */

    $.fn.findtitles = function(title, link, excerpt, word_count) {
      ftcount++;
      console.log('findtitles called ' + String(ftcount))
      console.log(title)
      console.log(link)
      console.log(excerpt)
      console.log(word_count)
      console.log("\n")
        //var pattern = new RegExp('[^A-Za-z0-9]' + title + '[^A-Za-z0-9]', 'g'),
        

        this.each(function() {
          console.log('this.each called.');
          console.log(this);
            $(this).contents().each(function() {
                if(this.nodeType === 3 && pattern.test(this.nodeValue)) {
                    console.log('Found text node containing title');
                    console.log(this.nodeType);
                    console.log(this);
                    console.log('Replacing');
                    console.log("\n")

                    $(this).replaceWith(this.nodeValue.replace(pattern, repl));
                }
                else if(!$(this).hasClass('pb')) {
                  console.log('This is a new non-text node so we need to recurse');
                  console.log(this.nodeType);
                  console.log("\n")
                  // console.log('Found element');
                  // console.log(this);
                  // console.log('Continuing');
                  $(this).findtitles(title, link, excerpt, word_count);
                }
            });
        });
        return this;
    };

    /* JS recursive function. Doesn't work */

    function highlight(element,title,link,excerpt,word_count) {
      console.log(element);
      if (element.childNodes.length > 0)
        console.log('length greater than 0');
        for (var i = 0; i < element.childNodes.length; i++) 
            highlight(element.childNodes[i]);

      if (element.nodeType == Node.TEXT_NODE && pattern.test(element.nodeValue)) {
        console.log('FOund, replacing');
        element.innerHTML = element.nodeValue.replace(pattern, repl);
      }
    }

    /* Tree walker */

    function walkerHighlight(el){
      var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
      while(n=walk.nextNode()) a.push(n);
      return a;
    }

    /* Tree walker 2 */
    // Prob that it returns js nodes etc.
    /* COuld try checking for style.display = 'block' */
    function nativeTreeWalker() {
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
        console.log(node.nodeValue);
          if(node.nodeValue && pattern.test(node.nodeValue)) {
            console.log('node matches');
            textNodes.push(node.nodeValue);
            $(node).replaceWith(node.nodeValue.replace(pattern, repl));
          }
      }
    }

    for(change in changes) {
      var title = changes[change].title;
      var link = changes[change].link;
      var excerpt = changes[change].excerpt;
      var word_count = changes[change].word_count;

      pattern = new RegExp('\\b' + title + '\\b', 'g');
        //var pattern = /\b + title + \b/g,
      repl = "<span class='pb pbtitle'>" + title + "</span>" + "<div class='pb pbpopup'><p><a href='" + link + "' target='_blank'>" + title + " Powerbase page</a></p><p>" + excerpt + "</p><p>" + word_count + " words</p></div>";

      console.log('make change')
      console.log(title)
      console.log(link)
      console.log(excerpt)
      console.log(word_count)
      console.log("\n")

      //$('body').findtitles(title, link, excerpt, word_count);
      //highlight(document.body)
      nativeTreeWalker()
      console.log("findtitles finished. Moving to next change\n");
      // var elems = $('*').filter(function() {
      //   return regex.test($(this).text());
      // });

      // console.log('elems.length: ' + String(elems.length));
      // console.log(elems);

      // Filter these by excluding all elements that contain another element in elems (ie. parent elements like body)

      // Problem with this is that some parent elements do include relevant child elements but should still be included

      // So why not do all the replacements in the body?
      // var replaceElems = [];
      // $.each(elems, function(index, value) {
      //   var unique = true;
      //   $.each(elems, function(subindex, subvalue) {
      //     if($.contains(value, subvalue)) {
      //       unique = false;
      //     }
      //   });
      //   if(unique == true) {
      //     replaceElems.push(value);
      //   }
      // });

      // Update the text in these filtered elements
      // var i = 0;
      // $.each(replaceElems, function(index, value) {
      //   var replaceHTML = value.innerHTML;

        // // Do all occurences where title is a full word surrounded by spaces
        // var regex = new RegExp(' ' + title + ' ', 'g');
        // replaceHTML = replaceHTML.replace(regex, " <span class='pbtitle'>" + title + "</span> <div class='pbpopup'><p><a href='" + link + "'>" +  title + " Powerbase page</a></p><p>" + excerpt + "</p><p>" + word_count + " words</p></div>");

        // // Do all occurences where title is right in an element e.g. <em>title</em>
        // var regex = new RegExp('>' + title + '<', 'g');
        // replaceHTML = replaceHTML.replace(regex, "><span class='pbtitle'>" + title + "</span><div class='pbpopup'><p><a href='" + link + "'>" +  title + " Powerbase page</a></p><p>" + excerpt + "</p><p>" + word_count + " words</p></div><");

        // // Do all occurences where title is a whole word followed by full stop or comma e.g. " title,"
        // var regex = new RegExp(' ' + title + '([,\.])', 'g');
        // replaceHTML = replaceHTML.replace(regex, "> <span class='pbtitle'>" + title + "</span>" + "$1" + "<div class='pbpopup'><p><a href='" + link + "'>" +  title + " Powerbase page</a></p><p>" + excerpt + "</p><p>" + word_count + " words</p></div><");

        // Combine all three above
        // var regex = new RegExp('([ >])' + title + '([ <,\.])', 'g');
        // replaceHTML = replaceHTML.replace(regex, "$1<span id='pbtitle" + i + "' class='pbtitle'>" + title + "</span>" + "<div id='pbpopup" + i + "' class='pbpopup'><p><a href='" + link + "' target='_blank'>" + title + " Powerbase page</a></p><p>" + excerpt + "</p><p>" + word_count + " words</p></div>$2");

        // value.innerHTML = replaceHTML;
        // i = i + 1;
      //});
    }
    console.log("All changes done. Moving to adding event listeners for popups\n");

    // Get all instances of pb titles that have been found in the page
    pbtitles = document.querySelectorAll('.pbtitle');

    // For each one, add an event handler to show its associated popup on mouseenter (and an event handler on the popup to hide it on mouseleave)
    for(var i = 0; i < pbtitles.length; i++) {
      //var id = pbtitles[i].id.replace('pbtitle', '');
      console.log('Adding event listener for below:');
      console.log(pbtitles[i]);
      console.log("\n");
      pbtitles[i].addEventListener('mouseenter', function() {
        var popup = $(this).next()[0]
        popup.addEventListener('mouseleave', function() {
          popup.style.display = 'none';
        })
        popup.style.display = 'block';
      });
    };
  };
  self.port.emit('finishedUpdating');
});
