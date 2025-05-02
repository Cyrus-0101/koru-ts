# KoruTS Game Engine

A WebGL-based TypeScript game engine focusing on 2D/3D rendering with modern web technologies.

## Architecture

### Core Components

#### [`KoruTSEngine`](src/core/engine.ts):

Main engine class orchestrating the game loop and rendering pipeline.

**Responsibilities:**

- Manages WebGL context and rendering pipeline
- Controls game loop timing and execution
- Handles shader program lifecycle
- Manages vertex buffer operations
- Responds to window resize events

**Example:**

```typescript
const engine = new KoruTSEngine();
engine.start(); // Initializes WebGL and starts game loop
```

#### [`GLUtilities`](src/core/gl/gl.ts)

Static utility class for WebGL context management.

**Responsibilities:**

- Handles canvas element creation and setup
- Initializes WebGL context with error checking
- Provides fallback handling for WebGL support
- Manages context attributes and extension

**Example**

```typescript
const canvas = GLUtilities.initialize(); // Creates canvas & WebGL context
```

#### [`GLBuffer`](src/core/gl/glBuffer.ts)

Manages vertex buffer objects and attribute configurations.

**Responsibilities:**

- Creates and manages VBOs
- Handles different data types (Float32, Int16, etc.)
- Configures vertex attribute layouts
- Manages buffer memory and uploads
- Supports multiple drawing primitives

**Example**

```typescript
   const buffer = new GLBuffer(3);  // 3 components per vertex (x,y,z)
   buffer.addAttributeLocation(new AttributeInfo(0, 3, 0));  // position attribute
   buffer.pushBackData([0.0, 0.5, 0.0, ...]);  // Add vertex data
   buffer.upload();  // Send to GPU
```

#### [`Shader`](src/core/gl/shaders.ts)

GLSL shader program management and compilation.

**Responsibilities:**

- Compiles vertex and fragment shaders
- Links shader programs
- Manages uniform locations
- Handles attribute bindings
- Provides error checking and logging

**Example**

```typescript
const shader = new Shader("basic", vertexShaderSource, fragmentShaderSource);
shader.use(); // Activate shader for rendering
```

#### [`Matrix4x4`](src/core/math/matrix4x4.ts)

Handles 4x4 matrix operations for 3D transformations and projections.

**Responsibilities:**
- Creates and manages 4x4 transformation matrices
- Provides orthographic projection matrix generation
- Handles column-major matrix operations
- Supports WebGL-compatible array format

**Matrix Structure**
```typescript
// Column-Major Order:
[
    2/(r-l),    0,         0,        -(r+l)/(r-l),
    0,       2/(t-b),      0,        -(t+b)/(t-b),
    0,          0,     2/(n-f),      -(f+n)/(n-f),
    0,          0,         0,             1
]
```
**Example:**
```typescript
// Create orthographic projection for 1920x1080 screen
const projection = Matrix4x4.orthographic(
    0,           // left
    1920,        // right
    0,           // bottom
    1080,        // top
    -1,          // near clip
    100          // far clip
);
```

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

```
src/
├── core/
│   ├── engine.ts          # Main engine class, game loop, and rendering setup
│   ├── math/
│   │   └── matrix4x4.ts   # Matrix operations and transformations
│   └── gl/
│       ├── gl.ts          # WebGL context and canvas initialization
│       ├── glBuffer.ts    # Buffer management (VBO, attributes)
│       └── shaders.ts     # GLSL shader compilation and management
├── graphics/
│   └── sprite.ts          # 2D sprite rendering and management
├── index.html             # Main HTML entry point
├── app.ts                 # Application initialization
└── tsconfig.json          # TypeScript configuration
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

### [PR:2 Sprite Rendering System Implementation](https://github.com/Cyrus-0101/koru-ts/pull/2)
This PR establishes the foundation for 2D rendering in the KoruTS engine. Core Changes:
1. Matrix4x4 Class
- Implemented orthographic projection matrix
- Added column-major matrix operations
- Documentation for matrix transformations

2. GLBuffer Improvements
- Added vertex buffer management
- Implemented attribute handling
- Added support for different data types
- Enhanced buffer binding operations

3. Sprite System
- Added basic Sprite class
- Implemented vertex buffer creation for sprites
- Added size and position management
- Set up draw operations

4. Engine Updates
- Integrated sprite rendering pipeline
- Added projection matrix support
- Implemented viewport management
- Added window resize handling

**Example**
Sprite creation and rendering:
```typescript
const sprite = new Sprite("test", 100, 100);
sprite.load();  // Sets up vertex buffer
sprite.draw();  // Renders using WebGL
```

### [PR:3 Assets & Messages Handling](https://github.com/Cyrus-0101/koru-ts/pull/3)
1. Asset Loading 
- Handling the complexities of downloading assets from a web server and the need for a standardized, reusable approach.

2. Asset Manager
- Responsible for downloading assets and notifying the engine when ready.

3. Messaging System
- A decoupled communication, creating Message and MessageBus classes.
- MessageBus manages message subscriptions, posting, and queuing.

4. Image Asset Loader
- Create an ImageAssetLoader class for loading image assets.

5. Convenience Methods/Refactor
- Implement convenience methods for sending and subscribing to messages.

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

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [MDN WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [WebGL Rendering Context](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)
- [WebGL Context](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
- [Shader Programs](https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram)
- [Buffer Objects](https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer)
- [Attribute Pointers](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)
