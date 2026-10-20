import sys,zipfile,re,html,os
out_dir=sys.argv[1]
for p in sys.argv[2:]:
    x=zipfile.ZipFile(p).read('word/document.xml').decode('utf8')
    lines=[]
    for para in re.findall(r'<w:p[ >].*?</w:p>',x,re.S):
        t=''
        for m in re.finditer(r'<w:t[^>]*>([^<]*)</w:t>|<w:br[^>]*/>|<w:tab/>',para):
            t+= html.unescape(m.group(1)) if m.group(1) is not None else ('\n' if 'br' in m.group(0) else ' ')
        for l in t.split('\n'):
            if l.strip(): lines.append(l.strip())
    name=os.path.basename(p)[:-5]
    open(os.path.join(out_dir,name+'.txt'),'w',encoding='utf8').write('\n'.join(lines)+'\n')
    print(name,len(lines))
