"""Create a small, self-contained editorial snapshot from the public WordPress API."""

import html
import io
import json
import re
import urllib.request
import urllib.parse
from html.parser import HTMLParser
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
IDS = [10721, 10724, 974, 10595, 12731, 12806, 14532, 10626]
LABELS = {
    10721: "Zdrowie",
    10724: "Moto & technologia",
    974: "Relacje",
    10595: "Aktywność",
    12731: "Zdrowie",
    12806: "Nauka",
    14532: "Kariera",
    10626: "Technologia",
}


class Extract(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tag = None
        self.current = []
        self.blocks = []

    def handle_starttag(self, tag, attrs):
        if tag in {"p", "h2", "h3"} and self.tag is None:
            self.tag = tag
            self.current = []

    def handle_endtag(self, tag):
        if tag == self.tag:
            value = re.sub(r"\s+", " ", html.unescape("".join(self.current))).strip()
            if len(value) > 25:
                self.blocks.append({"type": tag, "text": value})
            self.tag = None

    def handle_data(self, data):
        if self.tag:
            self.current.append(data)


def get(url):
    parts = urllib.parse.urlsplit(url)
    url = urllib.parse.urlunsplit((parts.scheme, parts.netloc, urllib.parse.quote(parts.path), parts.query, parts.fragment))
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read()


def plain(value):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def main():
    images = ROOT / "assets" / "images"
    images.mkdir(parents=True, exist_ok=True)
    posts = []
    for post_id in IDS:
        post = json.loads(get(f"https://www.dzienmezczyzny.pl/wp-json/wp/v2/posts/{post_id}?_embed"))
        media = post.get("_embedded", {}).get("wp:featuredmedia", [{}])[0]
        source = media.get("source_url")
        image_path = ""
        if source:
            raw = get(source)
            with Image.open(io.BytesIO(raw)) as picture:
                picture = picture.convert("RGB")
                picture.thumbnail((1400, 1000))
                image_path = f"assets/images/{post_id}.webp"
                picture.save(ROOT / image_path, "WEBP", quality=78, method=6)
        parser = Extract()
        parser.feed(post["content"]["rendered"])
        posts.append({
            "id": post_id,
            "title": plain(post["title"]["rendered"]),
            "category": LABELS[post_id],
            "date": post["date"][:10],
            "image": image_path,
            "source": post["link"],
            "summary": plain(post["excerpt"]["rendered"])[:230],
            "body": parser.blocks[:12],
        })
    (ROOT / "content.json").write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
