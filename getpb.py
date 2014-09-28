#!/usr/bin/env python

import requests, sqlite3, json, argparse

# --requests arg determines how many requests to make to powerbase. (Each request has limit of 500, and there's 000's of pages)
parser = argparse.ArgumentParser()
parser.add_argument('-r', default=1)
parser.add_argument('-n', action='store_true')
args = parser.parse_args()

# Connect to sqlite database
con = sqlite3.connect('pb.db')
cur = con.cursor()

# if -n has been set, truncate table and reset autoincrement before use.
if args.n:
  cur.execute('delete from page')
  cur.execute("delete from sqlite_sequence where name='page';")
  start_title = ''

# Otherwise add to existing table
else:
  cur.execute('select title from page order by id desc limit 1')
  start_title = cur.fetchone()[0]

skip = 0
requests_remaining = int(args.r)

# Make as many requests for content as have been specified in -r
while requests_remaining > 0:
  url = 'http://powerbase.info/api.php?action=query&list=allpages&aplimit=500&format=json'

  # For all except the first request, start from the last returned title of the previous request, and skip this title in the new request
  if start_title != '':
    url = url + '&apfrom=' + start_title.replace(' ', '_')
    skip = 1

  print(url)
  print(skip)

  # Make the request and put it in json format
  response = requests.get(url)
  pages =  json.loads(response.content)['query']['allpages']

  # add the titles to sqlite database

  title = ''
  
  for page in pages[skip:]:
    print page['title']
    title = page['title'].replace('"', '').replace("'", '')
    link = 'http://powerbase.info/index.php/' + title
    excerpt = title + 'is a guy...'
    cur.execute("insert into page (title, link, excerpt) values (?, ?, ?)", (title, link, excerpt))

  start_title = title
  requests_remaining = requests_remaining - 1

con.commit()
