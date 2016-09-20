export function presets() {
  return {
    default: [
      {
        from: [0.1, 0.25],
        to: [0.24, 0.26],
        scale: 10.0
      },
      {
        from: [0.24, 0.27],
        to: [0.28, 0.31],
        scale: 10.0
      },
      {
        from: [0.28, 0.32],
        to: [0.35, 0.40],
        scale: 20.0
      },
      {
        from: [0.30, 0.40],
        to: [0.40, 0.70],
        scale: 20.0
      },
      {
        from: [0.42, 0.45],
        scale: 10.0
      }
    ]
  };
}

export function loadPerset(preset, textures) {
  for (let i = 0; i < preset.length; i++) preset[i].texture = textures[i];
  return preset;
}
