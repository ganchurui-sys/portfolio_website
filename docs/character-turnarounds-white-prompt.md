# Character turnaround background cleanup

Tool mode: built-in image_gen, seven separate edit calls.

Final website assets: `public/aigc/project-01/turnarounds-white-v1/turnaround-01.webp` through `turnaround-07.webp`, plus matching `-thumb.webp` files.

The same prompt was applied separately to each original sheet. Original-resolution character pixels were restored with local foreground masks after generation, retaining the 3840 × 2160 source compositions.

## Final prompt

Use case: precise-object-edit / identity-preserve. Image 1 is the EDIT TARGET, an existing 16:9 character turnaround sheet for a white portfolio page. Change ONLY the pale gray studio background and all floor/cast shadows to absolutely uniform pure white #FFFFFF (RGB 255,255,255). Preserve every character exactly: same face, eyes, hair and flyaway strands, glasses, accessories, skin, clothing colors, logos, fabric details, poses, sizes, placement and lighting. Keep the complete original four-view layout and original 16:9 composition, without any cropping, reframing, resizing subjects, new objects, text or borders. Remove gray gradients, floor shadow and background texture everywhere outside the subjects, including gaps between legs and arms. Clean natural edges, no white halos. This is background cleanup only; do not redraw or redesign the characters. Return the edited sheet at the highest available resolution, ideally the original 3840x2160.
