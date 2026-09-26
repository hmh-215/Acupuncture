import zipfile
import xml.etree.ElementTree as ET
import sys

sys.stdout.reconfigure(encoding='utf-8')

docx_path = "TaiLieu-DauVao/Kinh cân.docx"

with zipfile.ZipFile(docx_path) as z:
    xml_content = z.read("word/document.xml")

tree = ET.fromstring(xml_content)
namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

paragraphs = []
for p in tree.iterfind('.//w:p', namespaces):
    p_text = "".join(t.text for t in p.iterfind('.//w:t', namespaces) if t.text)
    if p_text.strip():
        paragraphs.append(p_text.strip())

full_text = "\n\n".join(paragraphs)
print(f"Total paragraphs: {len(paragraphs)}")

with open("TaiLieu-DauVao/extracted_kinh_can.txt", "w", encoding="utf-8") as f:
    f.write(full_text)

print("Saved to TaiLieu-DauVao/extracted_kinh_can.txt")
print("\n--- FIRST 20 PARAGRAPHS ---\n")
for i, p in enumerate(paragraphs[:20]):
    print(f"[{i+1}] {p}")
