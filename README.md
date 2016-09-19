# whs-component-Terrain
WhitestormJS Terrain plugin

# Usage 

### With presets
```javascript
    const terrain = new WHS.Terrain({
      geometry: {
        map: 'assets/terrain/default_terrain.png', // Heightmap image.
        depth: 100, // Difference between min z and max z.
        width: 256, // Terrain x resolution
        height: 256 // Terrain y resolution
      },

      mass: 0, // Make it static.

      physics: {
        friction: 1,
        restitution: 0
      },

      material: ['default', // Use preset.
        [ // Array of textures for preset.
          WHS.texture('assets/textures/terrain/dirt-512.jpg'),
          WHS.texture('assets/textures/terrain/sand-512.jpg'),
          WHS.texture('assets/textures/terrain/grass-512.jpg'),
          WHS.texture('assets/textures/terrain/rock-512.jpg'),
          WHS.texture('assets/textures/terrain/snow-512.jpg')
        ]
      ]
    });
```

### Custom
```javascript
    const terrain = new WHS.Terrain({
      geometry: {
        map: 'assets/terrain/default_terrain.png', // Heightmap image.
        depth: 100, // Difference between min z and max z.
        width: 256, // Terrain x resolution
        height: 256 // Terrain y resolution
      },

      mass: 0, // Make it static.

      physics: {
        friction: 1,
        restitution: 0
      },

      material: [
        {
          from: [0.1, 0.25],
          to: [0.24, 0.26],
          scale: 10.0,
          texture: WHS.texture('assets/textures/terrain/dirt-512.jpg')
        },
        {
          from: [0.24, 0.27],
          to: [0.28, 0.31],
          scale: 10.0,
          texture: WHS.texture('assets/textures/terrain/sand-512.jpg')
        },
        {
          from: [0.28, 0.32],
          to: [0.35, 0.40],
          scale: 20.0,
          texture: WHS.texture('assets/textures/terrain/grass-512.jpg')
        },
        {
          from: [0.30, 0.40],
          to: [0.40, 0.70],
          scale: 20.0,
          texture: WHS.texture('assets/textures/terrain/rock-512.jpg')
        },
        {
          from: [0.42, 0.45],
          scale: 10.0,
          texture: WHS.texture('assets/textures/terrain/snow-512.jpg')
        }
      ]
    });
```

- **from** - Gradient start (applied texture).
- **to** - Gradient end (applied texture).
- **scale** - Texture scale.
- **texture** - `THREE.Texture` object.

## Heightmap example

![Heightmap](https://raw.githubusercontent.com/WhitestormJS/whs-component-terrain/master/examples/assets/terrain/default_terrain.png)

- Should be **grayscale**. (black <-> white).
- Resolution **should be a power of two** (256x256, 512x512, 1024x1024 ...)

# Result

![Result](https://cdn.pbrd.co/images/516FNEvR9.png)
