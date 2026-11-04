# Game assets

Place licensed runtime assets in `characters/`, `animations/`, `environments/`, `props/`, `audio/`, and `textures/`.
Vite copies this directory into the build; use URLs relative to `import.meta.env.BASE_URL`.

The foundation uses procedural geometry. Before adding an external asset, record its source, author, license, and any required attribution alongside it. Inspect GLB bounds and animation clips before placing a model.

The starter's Ammo runtime and its license remain in `public/ammo/`.
