var serverURL = 'http://pb.afnewsagency.org';
// var serverURL = 'http://127.0.0.1:14590';
var searchURL = serverURL;

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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('message received by highlight-titles.js');
  if(request.message == "highlightTitles") {
    if(document.location.protocol == 'https:') {
      chrome.runtime.sendMessage('httpsSite');
      alert('You cannot use the Powerbase plugin on https sites at present');
      return;
    }
    console.log('message is highlightTitles');
    //var pageContent = {'content': document.body.innerHTML};
    var pageContent = 'content=' + encodeURIComponent(document.body.innerHTML);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", searchURL, true);
    // xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
      console.log('xhr readystate has changed')
      if(xhr.readyState == 4) {
        console.log(xhr.status);
        if(xhr.status != 200) {
          chrome.runtime.sendMessage('requestFailed');
          alert('Request to the server failed with status:' + String(xhr.status));
          return;
        }
        console.log('xhr readystate is 4')
        console.log(xhr.responseText);
        if(xhr.responseText == '{}') {
          chrome.runtime.sendMessage('noTitlesFound');
          return;
        }
        var resp = JSON.parse(xhr.responseText);
        console.log(resp);
        updatePage(resp);
      }
    }
    // console.log(pageContent);
    // console.log(JSON.stringify(pageContent));
    xhr.send(pageContent);
  }
});

function updatePage(changes) {
  console.log('updatePage called');

  /* Add style information to document for highlighted titles and popups */

  var style = document.createElement('style');
  var css = ".pbtitle { background-color: yellow } \
  .pbpopup { display:none; position:absolute; top:-20px; z-index:999; max-width:500px; background-color:#eee; padding:10px; border:1px solid #999; border-radius:5px;} \
  .pbpopop a, .pbpopup a:visited, .pbpopup a:link { color:#1a0dab; } \
  .pbpopup p {font-size:14px; font-weight:normal; text-align:left; color:#333; white-space: normal; font-family: 'Open-sans', sans-serif;}";

  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  /* For each found article claim, add a popup to be shown when it is hovered over, and construct the necessary variables for the tree walk search and replace */

  var titles = {};
  var titlesRegex = '\\b';

  for(change in changes) {
    var changeId = change;
    var title = changes[change].title;
    var link = changes[change].link;
    var excerpt = changes[change].excerpt;
    var word_count = changes[change].word_count;

    /* Create the popup div (hidden by default) and append it to the body */
    var popup = document.createElement('div');
    popup.id = 'pbpopup' + changeId;
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
      e.target.style.display = 'none';
    });

    titles[title] = change;
    titlesRegex += '(' + title + ')|';
  }

  //console.log(walker);
  var node;
  var matchedNodes = [];
  titlesRegex = '\\b' + titlesRegex.slice(0, - 1) + '\\b';

  var pattern = new RegExp(titlesRegex, 'g');

  /* Walk the DOM tree inserting highlight spans where titles are found */

  var walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  

  function findTitles() {
    for(var i = 0; i < 700; i++) {
      if(!(node = walker.nextNode())) {
        matchedNodes.forEach(highlightMatch);
        chrome.runtime.sendMessage('titlesHighlighted');
        return;
      }
      if(node.nodeValue && node.parentElement.offsetWidth != 0 && pattern.test(node.nodeValue)) {
        console.log('node matches');
        var matchedNode = {};
        matchedNode['node'] = node;
        var matches = node.nodeValue.match(pattern);
        matchedNode['matches'] = matches;
        matchedNodes.push(matchedNode);
      }
    }
    console.log('For loop done')
    setTimeout(findTitles, 0);
  }

  findTitles();

  /* For each found textnode replace it with an element containing the original text with the title keyword highlighted */

  function highlightMatch(matchedNode, index, array) {
    var newSpan = document.createElement('span');
    var remainingText = matchedNode['node'].nodeValue;
    for(var i = 0; i < matchedNode['matches'].length; i++) {
      // Assume matchedNode['matches'] is in order they occur in string
      var match = matchedNode['matches'][i];
      var splitVal = [remainingText.split(match)[0], remainingText.split(match).slice(1).join(match)];
      console.log(splitVal);
      var before = '';
      var after = '';
      if(splitVal[0]) before = splitVal[0];
      if(splitVal[1]) after = splitVal[1];
      var highlight = document.createElement('span');
      highlight.id = 'pbtitle' + titles[match];
      highlight.className = 'pbtitle';
      highlight.textContent = match;
      highlight.addEventListener('mouseenter', function(e) {
        var rect = getOffsetRect(e.target);
        var popup = document.getElementById('pbpopup' + e.target.id.replace('pbtitle', ''));
        popup.style.position = 'absolute';
        popup.style.top = rect.top + 'px';
        popup.style.left = rect.left + 'px';
        popup.style.display = 'block';
      });
      if(before) {
        newSpan.appendChild(document.createTextNode(before));
      }
      newSpan.appendChild(highlight);
      remainingText = after;
    }

    // After node has been checked add the last bit

    if(remainingText) newSpan.appendChild(document.createTextNode(remainingText))

    matchedNode['node'].parentNode.replaceChild(newSpan, matchedNode['node']);
  }
}