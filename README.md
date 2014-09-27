Rich client
===========

Plugin has sqlite database of all powerbase article titles, links and excerpts. On page load searches HTML for titles in the database. For each that's found, add the info to client HTML.

https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting_started

http://en.wikipedia.org/wiki/She_Said

Thin client
===========

On page load plugin makes request to server, sending HTML. There's a database on the server with all PB article titles, excerpts and links. Database is searched and info returned for every found phrase. client HTML updated with popups / links etc. 