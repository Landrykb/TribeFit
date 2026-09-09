import os, json
from PIL import Image
import numpy as np
from scipy import ndimage

PNG = '/tmp/av_full.png'
OUT = 'public/avatar/sheet'

def load_mask():
    im = Image.open(PNG).convert('RGBA')
    a = np.array(im)
    colors = a[a[:,:,3]>0][:, :3].reshape(-1,3)
    vals, counts = np.unique(colors, axis=0, return_counts=True)
    bg = vals[counts.argmax()]
    mask = (a[:,:,3] > 0) & (np.linalg.norm(a[:,:,:3].astype(float) - bg, axis=2) > 22)
    return im, mask, bg

def trim(im):
    a = np.array(im)
    alpha = a[:,:,3]
    rows = np.where(alpha.max(axis=1) > 0)[0]
    cols = np.where(alpha.max(axis=0) > 0)[0]
    if len(rows)==0 or len(cols)==0:
        return im
    return Image.fromarray(a[rows[0]:rows[-1]+1, cols[0]:cols[-1]+1], 'RGBA')

def clean_cell(im, mask, bg, x0, x1, y0, y1):
    a = np.array(im.crop((x0, y0, x1, y1)).convert('RGBA'))
    m = (a[:,:,3] > 0) & (np.linalg.norm(a[:,:,:3].astype(float) - bg, axis=2) > 22)
    labeled, n = ndimage.label(m)
    if n > 0:
        sizes = np.bincount(labeled.ravel())[1:]
        largest = np.argmax(sizes) + 1
        keep = set([largest])
        for i, sz in enumerate(sizes):
            if sz >= 120:
                keep.add(i+1)
        m2 = np.zeros_like(m)
        for lab in keep:
            m2 |= (labeled == lab)
        a[~m2] = (0,0,0,0)
    return Image.fromarray(a, 'RGBA')

def extract_cells(im, mask, bg, y0, y1, x0, x1, n, prefix, manifest, start=1):
    step = (x1 - x0) / n
    for i in range(n):
        left = int(x0 + i*step + 1)
        right = int(x0 + (i+1)*step - 1)
        cell = clean_cell(im, mask, bg, left, right, y0, y1)
        cell = trim(cell)
        out = os.path.join(OUT, f'{prefix}-{start+i}.png')
        cell.save(out)
        manifest.append({'prefix': prefix, 'idx': start+i, 'file': out})

def main():
    im, mask, bg = load_mask()
    manifest = []
    os.makedirs(OUT, exist_ok=True)
    rows = [
        (55, 300, 25, 920, 6, 'body'),
        (55, 205, 930, 1535, 6, 'face_t'),
        (210, 320, 930, 1535, 6, 'face_b'),
        (340, 520, 25, 920, 8, 'hair'),
        (560, 755, 25, 920, 6, 'outfit'),
        (560, 670, 930, 1535, 6, 'acc_t'),
        (680, 775, 930, 1535, 1, 'acc_m'),
        (795, 1005, 25, 920, 5, 'aura'),
    ]
    for y0,y1,x0,x1,n,prefix in rows:
        extract_cells(im, mask, bg, y0, y1, x0, x1, n, prefix, manifest)
    with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=2)
    print('saved', len(manifest))

if __name__ == '__main__':
    main()
