import requests, sqlite3, json

# Get all article titles

url = 'http://powerbase.info/api.php?action=query&list=allpages&aplimit=10&format=json'
response = requests.get(url)
pages =  json.loads(response.content)['query']['allpages']

# add to sqlite database

con = sqlite3.connect('pb.db')
cur = con.cursor()
con.execute('delete from page')
for page in pages:
    print page['title']
    cur.execute("insert into page (title, link, excerpt) values (?, '', '')", (page['title'].replace('"', '').replace("'", ''),))

con.commit()