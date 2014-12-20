function highlightTitles() {
  chrome.runtime.sendMessage('highlightTitles')
}

document.getElementById('highlight-titles').addEventListener('click', highlightTitles);