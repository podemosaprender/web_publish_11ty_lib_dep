#INFO: read "short\turl\tsender\tgoal\n", generate redirect pages in o-o_static

import os
import csv
from urllib.request import urlopen
import subprocess
import shutil

DST_DIR="/home/uooweb/apps/ooweb_t3st_static"
TPL= DST_DIR+'/web-site-oo/tpl_redirect/index.html'
DATA_URL= "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtA4GotSEbDC8QR0_A6a1jZuRqWPVGfg51orH3Rngsh5W2Q9W0GdBVuLmasCZp1cGRh-Fkd0ZPW3fJ/pub?gid=553539019&single=true&output=tsv"

response = urlopen(DATA_URL)
lines = [line.decode('utf-8') for line in response.readlines()]
csv_reader = csv.reader(lines[1:], delimiter='\t')

tpl= None #DFLT

def gen_redirect(row):
	try:
		(url_short, url_long, html_msg)= row[:3]
		html_redirect=f'{html_msg}<br/><a href="{url_long}" target="_blank">{url_long}</a>'
		html= tpl.replace('##REDIRECT_HTML##', html_redirect);
		
		dst= DST_DIR+'/'+url_short
		if os.path.exists(dst):
			try:
				with open(dst+'/index.html','rt') as fcur:
					cur= fcur.read()
				if not 'section-redirect' in cur:
					print(f'ERROR: {row} is not a redirect')
					return #A: don't overwrite
			except:
				pass
		else:
		 	os.makedirs(dst, exist_ok=True)
		
		with open(dst+'/index.html','wt') as fout:
			fout.write(html)
		print(f'OK: {row} {html_redirect}')
	except Exception as ex:
		print(f'ERROR: {ex}')

def gen_repo(row):
	try:
		(url_short, data_s)= row[:2]
		data= data_s.split(' ')	
		if len(data)<2:
			print('ERROR, no repo link!')
			return

		repo= data[1]
		tag= data[2] if len(data)>2 else None

		print(f'REPO {repo} tag {tag}')

		dst= DST_DIR+'/'+url_short
		if os.path.exists(dst):
			try:
				with open(dst+'/.git/config','rt') as fcur:
					cur= fcur.read()
				if not repo in cur:
					print(f'ERROR: {row} is not this repo {cur}')
					return #A: don't overwrite
				#A: can overwrite
				r= subprocess.run(['/usr/bin/git','stash'], capture_output=True, cwd= dst)	
				print(r)
				r= subprocess.run(['/usr/bin/git','pull','--all'], capture_output=True, cwd= dst)	
				print(r)
				if not tag is None:
					r= subprocess.run(['/usr/bin/git','branch'], capture_output=True, cwd= dst)	
					print(f'CHECK tag {tag} in {r}')
					if tag in str(r.stdout):
						r= subprocess.run(['/usr/bin/git','checkout',tag], capture_output=True, cwd= dst)	
					else:
						r= subprocess.run(['/usr/bin/git','checkout',tag,'-b',tag], capture_output=True, cwd= dst)	
					print(r)

				isNextProject= os.path.exists(dst+'/_next')
				if isNextProject:
						r= subprocess.run(['find','-type','f','-exec','perl','-pi','-e','s/\/web_seminarios/\/en2hs\/aprende/g','{}',';'],  capture_output=True, cwd= dst)	
						print(f'FIXING URLS for NEXTJS {r}')
				else:
						print(f'Not a NEXTJS project {r}')

			except Exception as ex:
				print(f'ERROR: {row} {ex}')
				return
		else:
			#A: si existia lo borramos
			cmd= ['/usr/bin/git','clone']
			if not tag is None:
				cmd= cmd+ ['--branch',tag]
			cmd= cmd + [repo+'.git', dst]
			#DBG: shown in r, print(f'CLONE {cmd}')
			r= subprocess.run(cmd, capture_output=True)
			print(r)
	
	except Exception as ex:
		print(f'ERROR: {ex}')
	
redirect_rows=[]
for row in csv_reader:
	print(f'\nIN: {row}')
	if len(row)>1:
		if str(row[1]).startswith("REPO "):
			gen_repo(row)
		else:
			redirect_rows.append(row)
		print('\n============================================================')

with open(TPL,'rt') as f:
	tpl= f.read();  #A: read updated from WEB

for row in redirect_rows:
	print(f'\nIN: {row}')
	if len(row)>1:
		if not str(row[1]).startswith("REPO "):
			gen_redirect(row)
		print('\n============================================================')


