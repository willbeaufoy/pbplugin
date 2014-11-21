Powerbase browser plugin. Database of powerbase info is kept on the server (updated periodically from powerbase.info api), and the plugin queries this database to get the info it needs.

Firefox plugin
==============

* Uses addon-sdk.
* Content script gets body html, sends it in a POST request to the backend.
* On receipt of changes to make from backend, updates front end HTML highlighting relevant sections and adding Powerbase info popups.

Nodejs backend
==============

* Script receives POST request including document.body.innerHTML.
* Searches this innerHTML for titles in DB, then returns list of changes to make to client.

Python database creator
=======================

* Sends request/s to powerbase to get page title, link, excerpt and word count info and adds it to sqlite database. Script parameters determine how much info returned and how to treat existing data.

Excerpt problems
----------------

### First element got (not a table) is useless

* e.g. http://powerbase.info/index.php/10_Reasons_Why_We_Don%E2%80%99t_Need_GM_Foods first link is <p><b><a rel="nofollow" class="external text" href="http://www.spinprofiles.org/index.php/GM_Watch:_Portal">Back to GMWatch Portal</a></b>
</p>

### First element is 'Houses'

e.g. http://powerbase.info/index.php/123_Pall_Mall

### Dots in acronyms

* http://powerbase.info/index.php/A._G._Barr - First word is A.G

### <p> within table (so ignores 'no tables' rule)

* http://powerbase.info/index.php/ACPO