Powerbase browser plugin. Database of powerbase info is kept on the server (updated periodically from powerbase.info api), and the plugin queries this database to get the info it needs.

Firefox / Chrome extensions
===========================

* Content script gets body html, sends it in a POST request to the backend.
* On receipt of changes to make from backend, updates front end HTML highlighting relevant sections and adding Powerbase info popups.

Nodejs backend
==============

* Script receives POST request including document.body.innerHTML.
* Searches this innerHTML for titles in sqlite3 DB, then returns list of changes to make to client.

Python database creator
=======================

* Sends request/s to powerbase to get page title, link, excerpt and word count info and adds it to sqlite database. Script parameters determine how much info returned and how to treat existing data.