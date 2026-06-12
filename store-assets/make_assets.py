# 절약숲 스토어 에셋 생성 (콘솔 규격)
# 로고 600x600(라이트/다크), 썸네일 1932x828, 세로 스크린샷 636x1048 x3, 가로 1504x741
from PIL import Image, ImageDraw, ImageFont, ImageOps

FONT = '/System/Library/Fonts/AppleSDGothicNeo.ttc'
def font(size, weight='bold'):
    idx = {'regular': 0, 'medium': 2, 'semibold': 4, 'bold': 6}[weight]
    return ImageFont.truetype(FONT, size, index=idx)

GREEN, GREEN_D, GREEN_BG = '#00A05E', '#007A47', '#E5F6EE'
TEXT, SUB = '#191F28', '#56616E'

def draw_tree(d, cx, cy, scale):
    s = scale
    d.rounded_rectangle([cx-0.04*s, cy+0.05*s, cx+0.04*s, cy+0.32*s], radius=int(0.03*s), fill='#8B5E3C')
    d.ellipse([cx-0.28*s, cy-0.22*s, cx+0.08*s, cy+0.12*s], fill='#00A05E')
    d.ellipse([cx-0.08*s, cy-0.22*s, cx+0.28*s, cy+0.12*s], fill='#00B368')
    d.ellipse([cx-0.20*s, cy-0.34*s, cx+0.20*s, cy+0.02*s], fill='#00C16E')
    d.ellipse([cx+0.10*s, cy+0.10*s, cx+0.30*s, cy+0.30*s], fill='#FFC83D', outline='#E8A800', width=max(2, int(0.015*s)))
    d.text((cx+0.20*s, cy+0.20*s), '₩', font=font(int(0.13*s)), fill='#9A7100', anchor='mm')

def make_logo(path, dark=False):
    S = 600
    img = Image.new('RGB', (S, S), '#17331F' if dark else GREEN_BG)
    d = ImageDraw.Draw(img)
    d.ellipse([S*0.14, S*0.70, S*0.86, S*0.92], fill='#214A2E' if dark else '#CDEEDD')
    draw_tree(d, S*0.50, S*0.46, S*0.95)
    img.save(path)

def rounded_phone(src, width):
    # 스크린샷을 둥근 모서리 + 테두리 폰 목업으로
    ratio = src.height / src.width
    im = src.resize((width, int(width * ratio)), Image.LANCZOS)
    radius = int(width * 0.10)
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width, im.height], radius=radius, fill=255)
    im.putalpha(mask)
    border = Image.new('RGBA', (im.width + 16, im.height + 16), (0, 0, 0, 0))
    ImageDraw.Draw(border).rounded_rectangle(
        [0, 0, border.width - 1, border.height - 1], radius=radius + 8, fill='#191F28')
    border.alpha_composite(im, (8, 8))
    return border

def vgrad(w, h, top, bottom):
    base = Image.new('RGB', (1, h))
    t, b = ImageOps.exif_transpose(Image.new('RGB', (1, 1), top)).getpixel((0, 0)), \
           Image.new('RGB', (1, 1), bottom).getpixel((0, 0))
    px = base.load()
    for y in range(h):
        f = y / max(h - 1, 1)
        px[0, y] = tuple(int(t[i] + (b[i] - t[i]) * f) for i in range(3))
    return base.resize((w, h))

def make_thumbnail(path, home_png):
    W, H = 1932, 828
    img = vgrad(W, H, '#DFF4E8', '#BCE8D2').convert('RGB')
    d = ImageDraw.Draw(img)
    draw_tree(d, W*0.115, H*0.40, H*0.62)
    d.text((W*0.205, H*0.34), '절약숲', font=font(150), fill=TEXT, anchor='lm')
    d.text((W*0.21, H*0.55), '참은 만큼 자라는 숲', font=font(64, 'semibold'), fill=GREEN_D, anchor='lm')
    d.text((W*0.21, H*0.67), '참은 소비를 기록하면 나무가 자라고,', font=font(40, 'medium'), fill=SUB, anchor='lm')
    d.text((W*0.21, H*0.745), '매주 일요일 소비 리포트가 도착해요', font=font(40, 'medium'), fill=SUB, anchor='lm')
    phone = rounded_phone(home_png, 460)
    img.paste(phone, (W - phone.width - 110, 70), phone)
    img.save(path)

def make_portrait(path, src, caption, sub):
    W, H = 636, 1048
    img = vgrad(W, H, '#E9F7F0', '#D2EFDF').convert('RGB')
    d = ImageDraw.Draw(img)
    d.text((W // 2, 64), caption, font=font(42), fill=TEXT, anchor='mm')
    d.text((W // 2, 116), sub, font=font(26, 'medium'), fill=SUB, anchor='mm')
    phone = rounded_phone(src, 520)
    img.paste(phone, ((W - phone.width) // 2, 160), phone)
    img.save(path)

def make_landscape(path, shots):
    W, H = 1504, 741
    img = vgrad(W, H, '#DFF4E8', '#BCE8D2').convert('RGB')
    d = ImageDraw.Draw(img)
    d.text((90, 120), '절약숲', font=font(96), fill=TEXT, anchor='lm')
    for line, y in [('참은 소비를 기록하면', 240), ('나무가 자라요', 320)]:
        d.text((90, y), line, font=font(56, 'semibold'), fill=GREEN_D, anchor='lm')
    d.text((90, 420), '무지출 체크인 · 주간 소비 리포트', font=font(34, 'medium'), fill=SUB, anchor='lm')
    d.text((90, 475), '소비 페르소나 · 나무 도감 수집', font=font(34, 'medium'), fill=SUB, anchor='lm')
    x = 700
    for s in shots:
        phone = rounded_phone(s, 350)
        img.paste(phone, (x, 60), phone)
        x += 390
    img.save(path)

home = Image.open('store-assets/raw/home.png')
report = Image.open('store-assets/raw/report.png')
collection = Image.open('store-assets/raw/collection.png')

make_logo('store-assets/logo.png')
make_logo('store-assets/logo_dark.png', dark=True)
make_thumbnail('store-assets/thumbnail.png', home)
make_portrait('store-assets/screenshot_1.png', home, '참은 만큼 나무가 자라요', '참았어요 한 번이면 기록 끝')
make_portrait('store-assets/screenshot_2.png', report, '일요일 밤, 소비 리포트', '내 소비 페르소나와 절제력 점수')
make_portrait('store-assets/screenshot_3.png', collection, '다 키운 나무는 숲이 돼요', '나무마다 지킨 금액이 남아요')
make_landscape('store-assets/screenshot_landscape.png', [home, report])

for f in ['logo', 'logo_dark', 'thumbnail', 'screenshot_1', 'screenshot_2', 'screenshot_3', 'screenshot_landscape']:
    im = Image.open(f'store-assets/{f}.png')
    print(f, im.size)
