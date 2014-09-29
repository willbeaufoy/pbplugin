#!/usr/bin/env python

import requests, sqlite3, json, argparse, re, logging
from bs4 import BeautifulSoup

# Example usage: ./getpb.py -r 5 -n

# -r arg determines how many requests to make to powerbase. (Each request has limit of 500, and there's 000's of pages)
parser = argparse.ArgumentParser()
parser.add_argument('-r', default=1)
parser.add_argument('-n', action='store_true')
args = parser.parse_args()

# Connect to sqlite database
con = sqlite3.connect('pb.db')
cur = con.cursor()

# if -n has been set, truncate table and reset autoincrement before use.
if args.n:

  # CREATE TABLE page (id integer primary key autoincrement not null, title text not null, link text not null, excerpt text not null, word_count integer not null);

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
  url = 'http://powerbase.info/api.php?action=query&list=allpages&aplimit=100&format=json'

  # For all except the first request, start from the last returned title of the previous request, and skip this title in the new request
  if start_title != '':
    url = url + '&apfrom=' + start_title.replace(' ', '_')
    skip = 1

  # Make the request and put it in json format
  response = requests.get(url)
  pages =  json.loads(response.content)['query']['allpages']

  # add the titles to sqlite database
  title = ''
  for page in pages[skip:]:
    title = page['title'].replace('"', '').replace("'", '')
    title = page['title']
    link = 'http://powerbase.info/index.php/' + title.replace(' ', '_')

    # Access the relevant page to get the excerpt
    excerpt = ''
    word_count = ''
    try:
      response = requests.get(link)
      soup = BeautifulSoup(response.content)

      # Get the main text of the article
      text = soup.find(id='mw-content-text')

      # Get the excerpt
      if text.p:
        # This could be improved by not splitting at . if it occurs after a capital letter (e.g. in an acronym). However still problem of lower case acronyms and false positives like 'works for STRATFOR.'
        excerpt = text.p.get_text().split('. ')[0] + '...'
      else:
        if text.table:
          excerpt = text.table.parent.next_sibling.get_text().split('.')[0] + '...'
        else:
          excerpt = text.get_text().split('. ')[0] + '...'

      # Remove reference markers e.g. [1]
      excerpt = re.sub(r'\[\d\]', '', excerpt)

      word_count = len(text.get_text().split())

    except:
      pass

    print('Title: ' + title)
    print('Link: ' + link)
    print('Excerpt: ' + excerpt)
    print('Word count: ' + str(word_count))
    print('\n')

    cur.execute("insert into page (title, link, excerpt, word_count) values (?, ?, ?, ?)", (title, link, excerpt, word_count))

  start_title = title
  requests_remaining = requests_remaining - 1
  con.commit()

