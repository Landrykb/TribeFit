import os
import numpy as np
from PIL import Image

DIR = 'public/avatar/sheet'
REF = 'body-1.png'
MARGIN = 140

def chin_center(im, top_frac=0.65):
    a = np.array(im)
    mask = a[:,:,3] > 0
    if not mask.any():
        return (0, 0)
    rows = np.where(mask.any(axis=1))[0]
    h = rows[-1] - rows[0] + 1
    y0 = rows[0]
    y_limit = rows[0] + int(h * top_frac)
    m = mask[y0:y_limit, :]
    ys, xs = np.where(m)
    if len(xs) == 0:
        return (0, 0)
    # bottom of the top_frac region
    bottom_y = ys.max() + y0
    # x center at that row +/- 4
    band = mask[max(0, bottom_y - 4):min(mask.shape[0], bottom_y + 5), :]
    bys, bxs = np.where(band)
    cx = int(bxs.mean()) if len(bxs) > 0 else int(xs.mean())
    return (cx, bottom_y)

def main():
    im_ref = Image.open(os.path.join(DIR, REF)).convert('RGBA')
    ref_cx, ref_cy = chin_center(im_ref)
    canvas_w = im_ref.width + 2 * MARGIN
    canvas_h = im_ref.height + 2 * MARGIN
    ref_target = (ref_cx + MARGIN, ref_cy + MARGIN)
    files = sorted([f for f in os.listdir(DIR) if f.endswith('.png')])
    for f in files:
        im = Image.open(os.path.join(DIR, f)).convert('RGBA')
        cx, cy = chin_center(im)
        if cx == 0 and cy == 0:
            continue
        dx = ref_target[0] - cx
        dy = ref_target[1] - cy
        canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
        canvas.paste(im, (dx, dy), im)
        canvas.save(os.path.join(DIR, f))
        print(f, 'offset', dx, dy)

if __name__ == '__main__':
    main()
