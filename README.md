# cse5542 project 4

## usage
- open `index.html` in your browser
- controls:
  - `w`/`a`/`s`/`d`/`space`/`shift` (move sun)
  - arrowkeys/`,`/`.` (rotate camera)

## extras
- emission
- attenuation

## limitations
- i did all the lighting in worldspace
- i couldn't figure out how to get the normals to transform to worldspace, so the lighting doesn't account for rotation (e.g. planets) and scale (e.g. blahaj shark)
- i didn't actually write a model loader, i just pasted the json into `model.js`
