import base64
p = r" E:/minigame/antigravity/arena_studio_v110/game.html\
b = \CiAgPHNlY3Rpb24gaWQ9ImdhbWUtc2NyZWVuIiBjbGFzcz0iaGlkZGVuIHBpeGVsLWxheW91dCI+CiAgICA8ZGl2IGNsYXNzPSJ0b3AtaHVkIj4KICAgICAgPGRpdiBpZD0icGxheWVyLWluZm8tcml2YWwiPjwvZGl2PgogICAgICA8ZGl2IGlkPSJhY3RpdmUtZGVjay1jb3VudCIgY2xhc3M9ImJhZGdlIj7niYznurMgMDwvZGl2PgogICAgPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJib2FyZC1hcmVhIj4KICAgICAgPHNlY3Rpb24gY2xhc3M9InBhbmVsIHBpeGVsLW1pbmktbG9nIiBpZD0iYmF0dGxlLWxvZy1wYW5lbCIgc3R5bGU9InBvc2l0aW9uOmFic29sdXRlOyB0b3A6MDsgcmlnaHQ6MDsgbWF4LWhlaWdodDo4MHB4OyBvdmVyZmxvdzpoaWRkZW47IHotaW5kZXg6NTA7Ij48ZGl2IGlkPSJsb2ciIGNsYXNzPSJsb2ciPjwvZGl2Pjwvc2VjdGlvbj4KICAgICAgPGRpdiBjbGFzcz0iYm9hcmQtd3JhcCIgaWQ9ImJvYXJkLXdyYXAiPjxzdmcgaWQ9ImJvYXJkIiB2aWV3Qm94PSItMTM2IDAgMjEwMCAxNzUwIj48L3N2Zz48L2Rpdj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0iYm90dG9tLWh1ZCI+CiAgICAgIDxkaXYgY2xhc3M9InBsYXllci1yb3ciPjxkaXYgaWQ9InBsYXllci1pbmZvIj48L2Rpdj48YnV0dG9uIGlkPSJidG4tZW5kLXR1cm4iPue7k+adn+WbnuefajwvYnV0dG9uPjwvZGl2PgogICAgICA8ZGl2IGlkPSJoYW5kLXBhbmVsIj48ZGl2IGlkPSJoYW5kIiBjbGFzcz0iaGFuZCI+PC9kaXY+PGRpdiBpZD0iY2hvaWNlLXBhbmVsIiBjbGFzcz0iY2hvaWNlLXBhbmVsIj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0idG9vbGJhciI+PGJ1dHRvbiBpZD0iYnRuLW1vdmUiPuenu+WKqDwvYnV0dG9uPjxidXR0b24gaWQ9ImJ0bi1iYXNpYy1hdHRhY2siPuaZruaUuzwvYnV0dG9uPjxidXR0b24gaWQ9ImJ0bi1jYW5jZWwiPuWPlua2iDwvYnV0dG9uPjwvZGl2PgogICAgPC9kaXY+CiAgPC9zZWN0aW9uPg==\
v = base64.b64decode(b).decode(\utf-8\)
with open(p, \r\, encoding=\utf-8\) as f: c = f.read()
s = \<section id=\ + chr(34) + \game-screen\ + chr(34) + " class=\ + chr(34) + \hidden\ + chr(34) + \>\
e = \</main>\
if s in c and e in c:
    nc = c[:c.find(s)] + v + chr(10) + c[c.find(e):]
    with open(p, \w\, encoding=\utf-8\) as f: f.write(nc)
    print(\Done!\)
else: print(\Not found:\, s[:30])
