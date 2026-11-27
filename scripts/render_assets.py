#!/usr/bin/env python3
"""生成站点图标与分享图。

依赖 Playwright、Pillow 与本机 Chrome。只在修改视觉资产时才需要运行，
日常构建（npm run build）不依赖本脚本。

用法：npm run build && npm run assets   （分享图用到的宋体子集来自构建产物）

产物：
  public/favicon.svg                  复制自 src/assets/brand-mark.svg
  public/icons/favicon-32.png         32×32
  public/icons/apple-touch-icon.png   180×180（iOS 会自行裁圆角，这里输出满底方图）
  public/icons/icon-192.png           192×192
  public/icons/icon-512.png           512×512
  public/og/home.png                  1200×630 分享图
"""
import base64
import io
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
MARK = ROOT / "src" / "assets" / "brand-mark.svg"
RINGS = ROOT / "public" / "images" / "depth-rings.svg"
SERIF_SUBSET = ROOT / "public" / "fonts" / "zhisui-serif-600.woff2"
CORMORANT_DIR = ROOT / "node_modules" / "@fontsource" / "cormorant-garamond" / "files"
ICONS = ROOT / "public" / "icons"
OG = ROOT / "public" / "og"

# 设备像素比：按 2 倍渲染再缩回目标尺寸，边缘更平滑
DPR = 2

BASE_HTML = """<!doctype html>
<html><head><meta charset="utf-8"><style>
{font_css}
html, body {{ margin: 0; background: transparent; }}
.stage {{ position: relative; width: {w}px; height: {h}px; overflow: hidden; background: {bg}; }}
</style></head>
<body><div class="stage">{body}</div></body></html>
"""


def data_uri(path: Path, mime: str) -> str:
    """页面由 set_content 注入，无法引用 file:// 资源，一律内联成 data URI。"""
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode('ascii')}"


def font_css() -> str:
    """分享图用的字体：宋体用构建出的子集，Cormorant 用 fontsource 包里的拉丁 woff2。"""
    faces = [
        f'@font-face {{ font-family: "OG Serif"; src: url("{data_uri(SERIF_SUBSET, "font/woff2")}") '
        f'format("woff2"); font-weight: 600; }}'
    ]
    for weight, style in ((500, "italic"), (600, "normal")):
        matches = list(CORMORANT_DIR.glob(f"cormorant-garamond-latin-{weight}-{style}.woff2"))
        if not matches:
            sys.exit(f"[assets] 未找到 Cormorant 字体文件 {weight}-{style}，请先 npm install")
        faces.append(
            f'@font-face {{ font-family: "OG Latin"; src: url("{data_uri(matches[0], "font/woff2")}") '
            f'format("woff2"); font-weight: {weight}; font-style: {style}; }}'
        )
    return "\n".join(faces)


def shoot(page, html: str, width: int, height: int, out: Path) -> None:
    page.set_viewport_size({"width": width, "height": height})
    page.set_content(html, wait_until="load")
    page.wait_for_function("document.fonts.status === 'loaded'", timeout=15_000)
    page.wait_for_timeout(150)
    buffer = page.screenshot(
        type="png",
        clip={"x": 0, "y": 0, "width": width, "height": height},
        scale="device",
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(io.BytesIO(buffer)) as img:
        img.resize((width, height), Image.LANCZOS).save(out, optimize=True)
    print(f"[assets] {out.relative_to(ROOT).as_posix()}  {width}×{height}  {out.stat().st_size // 1024} KB", flush=True)


def icon_html(mark: str, size: int, bg: str) -> str:
    return BASE_HTML.format(
        font_css="",
        w=size,
        h=size,
        bg=bg,
        body=f'<div style="width:{size}px;height:{size}px">{mark}</div>',
    )


def og_html() -> str:
    bg = (
        "radial-gradient(900px 620px at 92% -12%, rgba(11,34,54,.9), transparent 62%),"
        "radial-gradient(520px 400px at -10% 30%, rgba(227,180,90,.09), transparent 60%),#060910"
    )
    rings = data_uri(RINGS, "image/svg+xml")
    mark = data_uri(MARK, "image/svg+xml")
    body = f"""
<img src="{rings}" style="position:absolute;right:-250px;top:50%;width:820px;translate:0 -50%;
  -webkit-mask-image:radial-gradient(circle,#000 36%,transparent 70%);mask-image:radial-gradient(circle,#000 36%,transparent 70%)">
<div style="position:absolute;left:84px;right:84px;top:80px;display:flex;align-items:center;gap:20px">
  <img src="{mark}" style="width:84px;height:84px">
  <div style="font-family:'OG Serif';font-weight:600;font-size:40px;letter-spacing:.2em;color:#f4f1e8;line-height:1.15">智邃科技</div>
  <div style="font-family:'OG Latin';font-style:italic;font-weight:500;font-size:26px;letter-spacing:.16em;color:#8d96a8;margin-left:8px;white-space:nowrap">Xiamen Zhisui Technology</div>
</div>
<div style="position:absolute;left:84px;top:232px;font-family:'OG Serif';font-weight:600;font-size:104px;line-height:1.1;letter-spacing:.08em;white-space:nowrap">
  <span style="color:#f4f1e8">智周万物，</span><span style="background:linear-gradient(100deg,#f6dfad,#e3b45a 60%,#f6dfad);-webkit-background-clip:text;background-clip:text;color:transparent">邃见未来</span>
</div>
<div style="position:absolute;left:84px;top:392px;font-family:'Microsoft YaHei UI','Microsoft YaHei',sans-serif;font-size:30px;letter-spacing:.12em;color:#c3c9d5">厦门智邃科技有限公司 · 软件与信息技术服务</div>
<div style="position:absolute;left:84px;right:84px;bottom:78px;height:1px;background:linear-gradient(90deg,rgba(227,180,90,.6),rgba(244,241,232,.08))"></div>
<div style="position:absolute;left:84px;bottom:34px;font-family:'OG Latin';font-style:italic;font-weight:500;font-size:30px;letter-spacing:.1em;color:#f4f1e8">www.xmsrv.tech</div>
<div style="position:absolute;right:84px;bottom:34px;font-family:'OG Latin';font-weight:600;font-size:30px;letter-spacing:.14em;color:#8d96a8">EST. 2021 · XIAMEN</div>
"""
    return BASE_HTML.format(font_css=font_css(), w=1200, h=630, bg=bg, body=body)


def main() -> None:
    for path in (MARK, RINGS, SERIF_SUBSET):
        if not path.exists():
            sys.exit(f"[assets] 缺少文件：{path.relative_to(ROOT).as_posix()}，请先执行 npm run build")
    mark = MARK.read_text(encoding="utf-8")
    # iOS 图标：满底方形，去掉圆角裁切与描边
    mark_square = mark.replace('rx="16"', 'rx="0"').replace(
        '<rect x=".5" y=".5" width="63" height="63" rx="15.5" stroke="#f4f1e8" stroke-opacity=".16"/>', ""
    )

    # 不使用 with / browser.close()：本机 Playwright 关闭浏览器时会挂起不返回。
    # 进程结束后驱动会自动回收它启动的 Chrome（见文件末尾的 os._exit）。
    driver = sync_playwright().start()
    browser = driver.chromium.launch(channel="chrome")
    page = browser.new_page(device_scale_factor=DPR)
    shoot(page, icon_html(mark, 32, "transparent"), 32, 32, ICONS / "favicon-32.png")
    shoot(page, icon_html(mark_square, 180, "#05070d"), 180, 180, ICONS / "apple-touch-icon.png")
    shoot(page, icon_html(mark, 192, "transparent"), 192, 192, ICONS / "icon-192.png")
    shoot(page, icon_html(mark, 512, "transparent"), 512, 512, ICONS / "icon-512.png")
    shoot(page, og_html(), 1200, 630, OG / "home.png")

    favicon = ROOT / "public" / "favicon.svg"
    favicon.write_text(mark, encoding="utf-8", newline="\n")
    print(f"[assets] {favicon.relative_to(ROOT).as_posix()}", flush=True)


if __name__ == "__main__":
    import os

    code = 0
    try:
        main()
    except Exception as error:
        print(f"[assets] 失败：{error}", file=sys.stderr, flush=True)
        code = 1
    finally:
        sys.stdout.flush()
        sys.stderr.flush()
        os._exit(code)
