# 절약숲 IAP 상품 이미지 9종 (1024x1024)
from PIL import Image, ImageDraw, ImageFont, ImageOps
import os

FONT = '/System/Library/Fonts/AppleSDGothicNeo.ttc'
APPLE_EMOJI = '/System/Library/Fonts/Apple Color Emoji.ttc'
def font(size, weight='bold'):
    idx = {'regular': 0, 'medium': 2, 'semibold': 4, 'bold': 6}[weight]
    return ImageFont.truetype(FONT, size, index=idx)
def efont(size):
    # Apple Color Emoji는 특정 픽셀 크기(160)만 지원 → 그 크기로 렌더 후 리사이즈
    return ImageFont.truetype(APPLE_EMOJI, 160)

OUT = 'store-assets/iap'
os.makedirs(OUT, exist_ok=True)

def vgrad(w, h, top, bottom):
    t = Image.new('RGB', (1, 1), top).getpixel((0, 0))
    b = Image.new('RGB', (1, 1), bottom).getpixel((0, 0))
    base = Image.new('RGB', (1, h))
    px = base.load()
    for y in range(h):
        f = y / (h - 1)
        px[0, y] = tuple(int(t[i] + (b[i] - t[i]) * f) for i in range(3))
    return base.resize((w, h))

def emoji_img(ch, px):
    """이모지 한 글자를 px 크기 RGBA로."""
    canvas = Image.new('RGBA', (180, 180), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    try:
        d.text((90, 90), ch, font=efont(160), anchor='mm', embedded_color=True)
    except Exception:
        d.text((90, 90), ch, font=font(120), anchor='mm', fill='#0F6C47')
    return canvas.resize((px, px), Image.LANCZOS)

def make(filename, emojis, title, bg_top='#EAF6F0', bg_bottom='#CDEBDB', badge=None):
    S = 1024
    img = vgrad(S, S, bg_top, bg_bottom).convert('RGBA')
    d = ImageDraw.Draw(img)
    # 중앙 흰 카드
    d.rounded_rectangle([S*0.12, S*0.13, S*0.88, S*0.70], radius=64, fill=(255, 255, 255, 235))
    # 이모지 배치 (1~3개)
    n = len(emojis)
    cy = int(S*0.40)
    if n == 1:
        sizes = [300]; xs = [S//2]
    elif n == 2:
        sizes = [230, 230]; xs = [int(S*0.37), int(S*0.63)]
    else:
        sizes = [200, 200, 200]; xs = [int(S*0.30), int(S*0.50), int(S*0.70)]
    for ch, sz, x in zip(emojis, sizes, xs):
        e = emoji_img(ch, sz)
        img.paste(e, (x - sz//2, cy - sz//2), e)
    # 상품명
    d.text((S//2, int(S*0.80)), title, font=font(76), fill='#191F28', anchor='mm')
    # 배지 (선택)
    if badge:
        bw = d.textlength(badge, font=font(40)) + 56
        bx, by = S//2 - bw//2, int(S*0.885)
        d.rounded_rectangle([bx, by, bx+bw, by+72], radius=36, fill='#0F6C47')
        d.text((S//2, by+36), badge, font=font(40), fill='#FFFFFF', anchor='mm')
    img.convert('RGB').save(f'{OUT}/{filename}.png')

# 1~9
make('fert_s',   ['🌿'],            '비료 1개', badge='물방울 +15')
make('fert_m',   ['🌿', '🌿'],      '비료 4개', badge='+1 보너스 · 물방울 +75')
make('tree_pack_season', ['🌸', '🍁', '🎄'], '시즌 나무 3종')
make('tree_pack_garden', ['🌻', '🌷', '🌹'], '꽃 정원 3종')
make('tree_pack_exotic', ['🌴', '🌵', '🎋'], '이색 나무 3종')
make('tree_pack_lucky',  ['🍀', '🍄', '💰'], '행운 나무 3종', badge='황금나무 포함')
make('remove_ads', ['🚫'],         '광고 제거', bg_top='#EAF1F6', bg_bottom='#D6E2EC')
make('premium_m', ['👑'],          '프리미엄', bg_top='#FFF6E5', bg_bottom='#FFE8BF', badge='월 구독')
make('premium_y', ['👑'],          '프리미엄', bg_top='#FFF6E5', bg_bottom='#FFE0A8', badge='연 구독 · 48% 할인')

for f in sorted(os.listdir(OUT)):
    print(f, Image.open(f'{OUT}/{f}').size)
