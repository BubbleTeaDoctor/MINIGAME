import os

def convert_to_utf8(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.json', '.html', '.css')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'rb') as f:
                        raw = f.read()
                    
                    try:
                        text = raw.decode('utf-8')
                        continue # Already UTF-8
                    except UnicodeDecodeError:
                        pass
                    
                    try:
                        text = raw.decode('gbk')
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(text)
                        print(f"Converted to UTF-8: {filepath}")
                    except UnicodeDecodeError:
                        print(f"Failed to decode: {filepath}")
                except Exception as e:
                    print(f"Error on {filepath}: {e}")

convert_to_utf8(r'E:\minigame\antigravity\arena_studio_v110')
