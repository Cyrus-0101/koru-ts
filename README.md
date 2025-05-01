# KoruTS Game Engine

A WebGL-based TypeScript game engine focusing on 2D/3D rendering with modern web technologies.

## Architecture

### Core Components

- [`KoruTSEngine`](src/core/engine.ts): Main engine class managing:

  - WebGL context and rendering pipeline
  - Game loop
  - Shader management
  - Buffer handling
  - Window resize events

- [`GLUtilities`](src/core/gl/gl.ts): WebGL initialization and context management

  - Canvas creation/initialization
  - WebGL context setup
  - Error handling

- [`Shader`](src/core/gl/shaders.ts): GLSL shader program management
  - Vertex/Fragment shader compilation
  - Program linking
  - Shader activation

### Current Features

1. **WebGL Context Management**

   - Automatic canvas creation
   - WebGL context initialization
   - Error handling for unsupported browsers

2. **Shader System**

   - GLSL shader compilation
   - Program linking
   - Basic vertex and fragment shaders
   - Attribute handling

3. **Rendering Pipeline**

   - Vertex buffer creation
   - Attribute pointer configuration
   - Basic triangle rendering
   - Frame clearing and buffer management

4. **Window Management**
   - Responsive canvas sizing
   - Window resize handling
   - Fullscreen support

## Technical Implementation

How WebGL Works:

1. JavaScript Control:
   WebGL is controlled through JavaScript, which sends commands to the browser's GPU.
2. Rendering Pipeline:
   WebGL utilizes a rendering pipeline, where vertices, shaders, and other data are processed by the GPU to create 3D graphics.
3. Shaders:
   Shaders, written in `GLSL`, define how objects are drawn, including their appearance, lighting, and other visual effects.
4. GPU Acceleration:
   The GPU processes the data and shaders, rendering the 3D scene efficiently and providing high-performance graphics.
5. Display:
   The rendered 3D graphics are then displayed within the HTML5 `<canvas>` element.

### WebGL References

- [WebGL Context](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
- [Shader Programs](https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram)
- [Buffer Objects](https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer)
- [Attribute Pointers](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)

### v1 Shader Implementation

```glsl
// Vertex Shader
attribute vec3 a_position;

void main() {
    gl_Position = vec4(a_position, 1.0);
}

// Fragment Shader
precision mediump float;

void main() {
    gl_FragColor = vec4(1.0);
}
```

### File Structure

### File Structure

```
src/
├── core/
│   ├── engine.ts       # Main engine class, game loop, and rendering setup
│   └── gl/
│       ├── gl.ts       # WebGL context and canvas initialization
│       ├── glBuffer.ts # Buffer management (VBO, attributes)
│       └── shaders.ts  # GLSL shader compilation and management
├── shaders/           # GLSL shader source files
│   ├── basic.vert.ts  # Basic vertex shader
│   └── basic.frag.ts  # Basic fragment shader
├── index.html        # Main HTML entry point
├── app.ts           # Application initialization
└── tsconfig.json    # TypeScript configuration
```

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Build the project:

```bash
bun run build
```

3. Open `index.html` in a browser to see a white triangle rendered on a black background.

## Current Status

The engine currently demonstrates:

- Basic WebGL setup and initialization
- Shader compilation and management
- Simple geometry rendering (triangle)
- Game loop implementation
- Basic window management

### [PR:1 Triangles](https://github.com/Cyrus-0101/koru-ts/pull/1)

Changes:

1. Shader Management
   Added complete shader pipeline:

```typescript
private loadShaders(): void {
    let vertexShaderSource = `
        attribute vec3 a_position;
        void main() {
            gl_Position = vec4(a_position, 1.0);
        }`;

    let fragmentShaderSource = `
        precision mediump float;
        uniform vec4 u_color;
        void main() {
            gl_FragColor = u_color;
        }`;
}
```

2. Buffer Management
   Added GLBuffer class with:

- Vertex buffer creation and management
- Attribute handling
- Data upload to GPU
- Drawing functionality

3. Triangle Rendering
   Implemented basic triangle rendering:

```typescript
private createBuffer(): void {
    let vertices = [
        // x,    y,    z
        0.0,  0.0,  0.0,  // bottom-left
        0.0,  0.5,  0.0,  // top-left
        0.5,  0.5,  0.0   // top-right
    ];
}
```

## Next Steps

- [ ] Add texture support
- [ ] Implement camera system
- [ ] Add basic 2D sprite rendering
- [ ] Implement basic physics
- [ ] Add input handling
- [ ] Implement scene graph
- [ ] Add asset loading system

## Development

Built with:

- TypeScript
- WebGL
- Bun v1.2.3 (for building and development)

## References

- [WebGL Fundamentals](https://webglfundamentals.org/)
- [MDN WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [WebGL Rendering Context](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)
