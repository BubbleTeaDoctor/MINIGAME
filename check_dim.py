import struct, os
d = r"E:\minigame\antigravity\arena_studio_v110\assets\sprites\blue-witch"
for f in os.listdir(d):
    if f.endswith(".png"):
        with open(os.path.join(d, f), "rb") as fp:
            fp.read(16)
            w, h = struct.unpack(">II", fp.read(8))
            print(f"{f}: {w} x {h}")
