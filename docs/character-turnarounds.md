# Project 01 — Character Turnarounds

Added locally on 2026-09-20 as the third visual section, after the interactive
portrait and Pose Studies. The project introduction remains above the portrait.

All seven supplied sheets retain their complete 3840 × 2160 compositions,
including the expressive portrait and the front, side, and back views.
The source PNGs are read-only. The current sheets have a pure #FFFFFF backdrop
with the original character pixels restored at their original positions and
resolution. Full-size WebP exports are lossless; no final sheets are cropped or
resized. The earlier gray-background exports remain locally in `turnarounds-v1`.

Source directory: `/Users/zhong/Desktop/个人网站/素材/个人ip人物/三视图`

| Look | Source PNG | Web asset |
| --- | --- | --- |
| 01 / Racing Jacket | jimeng-2026-09-20-2779-个人ip.png | turnaround-01.webp |
| 02 / Forest Hoodie | jimeng-2026-09-20-5369-个人ip.png | turnaround-02.webp |
| 03 / Layered Streetwear | jimeng-2026-09-20-7386-个人ip.png | turnaround-03.webp |
| 04 / Cap & Headphones | jimeng-2026-09-20-1975-个人ip.png | turnaround-04.webp |
| 05 / Brown Jacket | jimeng-2026-09-20-9658-个人ip.png | turnaround-05.webp |
| 06 / Denim & Tie | jimeng-2026-09-20-8492-个人ip.png | turnaround-06.webp |
| 07 / Checked Shirt | jimeng-2026-09-20-8924-个人ip.png | turnaround-07.webp |

Current assets are in `public/aigc/project-01/turnarounds-white-v1/`.
Separate 480 × 270 `-thumb.webp` previews keep the seven-item selector lightweight.
The main view, thumbnail selector, and full-size dialog all use these white sheets.

White-background preparation uses the built-in image_gen tool once per original,
followed by original-resolution foreground restoration. The generated edits guide
background cleanup; source RGB pixels are used for the characters so faces, fabric,
logos, poses and composition are not replaced by regenerated approximations.
Native foreground masks preserve antialiased edges and light clothing. The narrow
side views in sheets 01 and 04 use additional masks from original-resolution crops
at x=2600, y=0, width=540, height=2160, because the full-sheet detector missed them.

Guides, prompt provenance, masks and pixel-validation results are saved locally in
`output/imagegen/turnarounds-white-v1/`. `scripts/prepare-white-turnarounds.mjs`
takes the original source folder, masks folder, guide folder, and output folder.
It validates all four views and verifies a lossless full-resolution export. The
seven compositions were also reviewed visually, including the repaired side views.

The gallery supports drag, thumbnail selection, previous/next controls, and
keyboard arrows. Clicking a sheet opens a native dialog with the full-resolution
asset, detail zoom, and Escape/Close dismissal. Reduced-motion preferences are
respected for slide changes. No automatic slideshow is used.
