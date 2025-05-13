# KoruTS Game Engine

A WebGL-based TypeScript game engine focusing on 2D/3D rendering with modern web technologies.


### Current Features

1. **Rendering System**
   - WebGL context management
   - GLSL shader compilation and linking
   - Vertex buffer management
   - Material-based rendering
   - Sprite system with textures
   - Color tinting support
   - UV coordinate mapping

2. **Resource Management**
   - Reference-counted textures and materials
   - Asynchronous asset loading
   - Automatic resource cleanup
   - Material and texture caching
   - Memory optimization through sharing
   - Hierarchical loading system

3. **Mathematics**
   - Matrix4x4 transformations
   - Local/world space transforms
   - Vector2/3 operations
   - Orthographic projection
   - Transform hierarchy calculations
   - Parent-child transformations

4. **Core Architecture**
   - Component-based system
   - Scene graph hierarchy
   - Zone management system
   - Message bus communication
   - Asset management pipeline
   - Game loop optimization
   - State machine integration

5. **Graphics Features**
   - Material system
   - Texture unit management
   - Mipmap generation
   - Color tinting
   - Sprite transformations
   - Component-based rendering
   - Attribute handling

6. **Scene Management**
   - Hierarchical scene graph
   - Zone-based level system
   - Resource lifecycle management
   - Object transformation inheritance
   - Component lifecycle handling
   - Scene state management

### Next Steps

- [x] Add texture support
- [ ] Implement camera system
- [x] Add basic 2D sprite rendering
- [ ] Implement basic physics
- [ ] Add input handling
- [x] Implement scene graph
- [x] Add asset loading system
- [ ] Add texture atlasing
- [ ] Implement sprite batching
- [x] Add mipmap support
- [ ] Implement texture compression

### Development

Built with:

- TypeScript
- WebGL
- Bun v1.2.3 (for building and development)

### Technical Implementation

> How WebGL Works:

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

#### [`Vector3`](src/core/math/vector3.ts)

Represents a 3D vector with x, y, z components for spatial operations.

**Responsibilities:**
- Stores 3D coordinates and directions
- Provides vector math operations
- Supports position and scaling operations
- Converts to WebGL-compatible formats

**Vector Components:**
```typescript
class Vector3 {
    private _x: number;  // X component
    private _y: number;  // Y component
    private _z: number;  // Z component
}
```

**Common Uses:**
- Object positions
- Movement directions
- Scale factors
- Force vectors
- Normal vectors

**Example:**
```typescript
// Create a position vector
const position = new Vector3(100, 200, 0);

// Access components
position.x = 150;  // Move right
position.y += 10;  // Move up

// Convert to array for WebGL
const vertexData = position.toFloat32Array();
```

#### [`MessageBus`](src/core/message/messageBus.ts)

Central message distribution system implementing the Publisher/Subscriber pattern.

**Responsibilities:**
- Message distribution and queuing
- Priority-based message processing
- Handler subscription management
- Decoupled component communication

**Example:**
```typescript
// Subscribe to messages
MessageBus.addSubscription("COLLISION", this);

// Post a message
MessageBus.post(new Message("COLLISION", this, { damage: 50 }));

// Process queued messages
MessageBus.update(gameTime);
```

#### [`AssetManager`](src/core/assets/assetManager.ts)

Singleton system for managing game assets and resource loading.

**Responsibilities:**
- Asset loading and caching
- Loader type resolution
- Resource lifecycle management
- Loading state tracking

**Example:**
```typescript
// Register a custom loader
AssetManager.registerLoader(new TextureLoader());

// Load an asset
AssetManager.loadAsset("player.png");

// Get a loaded asset
const texture = AssetManager.getAsset("player.png");
```

#### [`Texture`](src/core/graphics/texture.ts)

Handles WebGL texture loading and management.

**Responsibilities:**
- Asynchronous texture loading
- WebGL texture lifecycle management
- Texture unit binding
- Mipmap generation
- Placeholder texture during load

**Example:**
```typescript
// Create and load a texture
const texture = new Texture("player.png");

// Bind for rendering
texture.activateAndBind(0);  // Use texture unit 0
```

#### [`TextureManager`](src/core/graphics/textureManager.ts)

Singleton system for texture resource management.

**Responsibilities:**
- Reference counting for textures
- Automatic resource cleanup
- Texture caching
- Memory optimization


**Example:**
```typescript
// Get or create a texture (increments reference count)
const texture = TextureManager.getTexture("player.png");

// Release when done (decrements reference count)
TextureManager.releaseTexture("player.png");
```

#### [`Material`](src/core/graphics/material.ts)

Combines textures and colors for rendering configuration.

**Responsibilities:**
- Texture and color tint management
- Reference counting integration
- WebGL uniform configuration
- Resource lifecycle handling

**Example:**
```typescript
// Create material with texture and blue tint
const material = new Material(
    "crate",
    "assets/textures/crate.jpg",
    new Color(0, 128, 255, 255)
);

// Use in sprite
sprite.setMaterial(material);
```

#### [`MaterialManager`](src/core/graphics/materialManager.ts)

Singleton system for material resource management.

**Responsibilities:**
- Material caching and reuse
- Reference counting for materials
- Automatic cleanup of unused materials
- Memory optimization

**Example:**
```typescript
// Register a new material
MaterialManager.registerMaterial(material);

// Get existing material (increments reference)
const material = MaterialManager.getMaterial("crate");

// Release when done
MaterialManager.releaseMaterial("crate");
```

#### [`Color`](src/core/graphics/color.ts)

RGBA color representation with WebGL compatibility.

**Responsibilities:**
- Color component management (RGBA)
- WebGL-compatible format conversion
- Common color preset support
- Alpha transparency support

**Example:**
```typescript
// Create custom color
const purple = new Color(128, 0, 128, 255);

// Get WebGL format
const glColor = purple.toFloat32Array();

// Use preset
const white = Color.white();
```

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

### v2 Shader Implementation
```glsl
// Added projection and model calculations to the vertex shader
attribute vec3 a_position;

uniform mat4 u_projection;
uniform mat4 u_model;

void main() {
    gl_Position = u_projection * u_model * vec4(a_position, 1.0);
};

// Basic fragment shader
precision mediump float;

uniform vec4 u_color;

void main() {
    gl_FragColor = u_color;
};
```

### File Structure

```
src/
├── core/
│   ├── assets/
│   │   ├── assetManager.ts                 # Asset loading and management
│   │   ├── IAsset.ts                       # Asset interface definition
│   │   ├── IAssetLoader.ts                 # Asset loader interface
│   │   └── imageAssetLoader.ts             # Image loading implementation
│   ├── graphics/
│   │   ├── texture.ts                      # WebGL texture management
│   │   ├── textureManager.ts               # Texture reference counting
│   │   ├── material.ts                     # Material definition & management
│   │   ├── materialManager.ts              # Material reference counting
│   │   ├── color.ts                        # RGBA color management
│   │   └── sprite.ts                       # 2D sprite rendering
│   ├── message/
│   │   ├── messageBus.ts                   # Message distribution system
│   │   ├── message.ts                      # Message class definition
│   │   ├── IMessageHandler.ts              # Message handler interface
│   │   └── messageSubscriptionNode.ts      # Message queue node
│   ├── math/
│   │   ├── matrix4x4.ts                    # Matrix transformations
│   │   ├── vector2.ts                      # 2D vector operations
│   │   └── vector3.ts                      # 3D vector operations
│   ├── gl/
│   │   ├── gl.ts                           # WebGL context management
│   │   ├── glBuffer.ts                     # Buffer operations
│   │   └── shaders/                        # Shader implementations
│   │       ├── shaders.ts                  # Base shader class
│   │       └── basicShader.ts              # Basic material shader
│   └── engine.ts                           # Main engine class
├── shaders/
│   ├── basic.vert.ts                       # Basic vertex shader source
│   └── basic.frag.ts                       # Basic fragment shader source
├── index.html                              # Entry point
├── app.ts                                  # Application setup
└── tsconfig.json                           # TypeScript config
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

3. Open `index.html` in a browser.

### Example Usage:
```typescript
// Initialize engine
const engine = new KoruTSEngine();

// Create and load a textured sprite
const sprite = new Sprite("player", "assets/player.png");
sprite.load();

// Position sprite
sprite.position.x = 100;
sprite.position.y = 200;

// Start the engine
engine.start();
```

### [PR:1 Triangles](https://github.com/Cyrus-0101/koru-ts/pull/1)

Changes:

1. **Shader Management**
   - Added complete shader pipeline:

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

2. **Buffer Management**
   - Added GLBuffer class with:
      - Vertex buffer creation and management
      - Attribute handling
      - Data upload to GPU
      - Drawing functionality

3. **Triangle Rendering**
   - Implemented basic triangle rendering:

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

1. **Matrix4x4 Class**
   - Implemented orthographic projection matrix
   - Added column-major matrix operations
   - Documentation for matrix transformations

2. **GLBuffer Improvements**
   - Added vertex buffer management
   - Implemented attribute handling
   - Added support for different data types
   - Enhanced buffer binding operations

3. **Sprite System**
   - Added basic Sprite class
   - Implemented vertex buffer creation for sprites
   - Added size and position management
   - Set up draw operations

4. **Engine Updates**
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

The PR establishes a robust foundation for asset management and component communication in the engine.

1. **Asset Management System**
   - Implemented `AssetManager` singleton for centralized resource management
   - Added asset loading pipeline with support for different asset types
   - Created `IAsset` and `IAssetLoader` interfaces
   - Implemented image asset loading with `ImageAssetLoader`
   - Added asset caching and state management

2. **Messaging System**
   - Added `MessageBus` for decoupled component communication
   - Implemented priority-based message processing
   - Created message subscription and handling system
   - Added support for HIGH and NORMAL priority messages
   - Implemented message queuing for NORMAL priority

3. **Integration**
   - Connected asset loading with message system for load notifications
   - Added asset load completion messaging
   - Implemented message-based asset state updates


### [PR:4 Texture System Implementation](https://github.com/Cyrus-0101/koru-ts/pull/4)

This PR implements texture loading and management with reference counting:

1. **Texture Management**
   - Added `TextureManager` singleton for centralized texture handling
   - Implemented reference counting for automatic cleanup
   - Added texture caching to prevent duplicate loading
   ```typescript
   // Get a texture (creates or increments reference)
   const texture = TextureManager.getTexture("player.png");
   
   // Release when done (decrements reference)
   TextureManager.releaseTexture("player.png");
   ```

2. **Asset Loading System**
   - Implemented asynchronous texture loading
   - Added message-based load notifications
   - Created placeholder white texture during load
   ```typescript
   // Load texture asynchronously
   AssetManager.loadAsset("player.png");
   
   // Listen for load completion
   Message.subscribe("ASSET_LOADED", this);
   ```

3. **Sprite System Updates**
   - Added texture coordinate support
   - Implemented UV mapping for sprites
   - Added texture binding in render pipeline
   ```typescript
   const sprite = new Sprite("player", "player.png");
   sprite.load();  // Sets up vertices and UVs
   sprite.draw();  // Binds texture and renders
   ```

4. **WebGL Integration**
   - Added texture parameter configuration
   - Implemented texture unit management
   - Added texture uniform support in shaders

### [PR:5 Material System Implementation](https://github.com/Cyrus-0101/koru-ts/pull/5)

This PR implements a complete material system with color tinting and texture management:

1. **Material Management**
   - Added MaterialManager singleton for centralized handling
   - Implemented reference counting for materials
   - Added material caching to prevent duplicates
   ```typescript
   // Register a new material
   MaterialManager.registerMaterial(new Material(
     "crate",
     "assets/textures/crate.jpg",
     new Color(0, 128, 255, 255)
   ));
   
   // Get material (increments reference)
   const material = MaterialManager.getMaterial("crate");
   ```

2. **Color System**
   - Added Color class for RGBA management
   - Implemented WebGL-compatible color formats
   - Added common color presets
   ```typescript
   // Create custom color with alpha
   const tint = new Color(255, 128, 0, 255);  // Orange
   
   // Convert for WebGL use
   const glColor = tint.toFloat32Array();
   ```

3. **Sprite Integration**
   - Updated sprites to use materials
   - Added color tinting support
   - Implemented material reference management
   ```typescript
   // Create sprite with material
   const sprite = new Sprite("player", "crate");
   sprite.load();
   
   // Material color affects rendering
   sprite.draw(shader);  // Uses material's texture and tint
   ```

4. **Shader Updates**
   - Added material uniform support
   - Implemented texture sampling
   - Added color tinting in fragment shader
   ```glsl
   // Fragment shader with material support
   uniform vec4 u_tint;        // Material color
   uniform sampler2D u_diffuse;  // Material texture
   
   void main() {
    gl_FragColor = texture2D(u_diffuse, v_texCoord) * u_tint;
   }
   ```

5. **Resource Management**
   - Automatic cleanup of unused materials
   - Reference counting for textures and materials
   - Memory optimization through shared resources
   ```typescript
   // Material cleanup
   MaterialManager.releaseMaterial("crate");  // Decrements reference
   ```
### [PR:6 Architecture & Hierachy](https://github.com/Cyrus-0101/koru-ts/pull/6)

This PR implements a robust scene graph and component system for game object management:

1. **Scene Graph Implementation**
   - Added hierarchical object relationships
   - Implemented parent-child transformations
   - Added scene management system

   ```typescript
   // Create parent-child relationship
   const parent = new SimObject(1, "parent");
   const child = new SimObject(2, "child");
   parent.addChild(child);
   
   // Child inherits parent's transformations
   parent.transform.rotation.z = Math.PI / 4;  // 45 degrees
   ```

2. **Component System**
   - Implemented component-based architecture
   - Added base component class
   - Created sprite component

   ```typescript
   // Add sprite component to object
   const player = new SimObject(1, "player");
   const spriteComponent = new SpriteComponent("render", "playerTexture");
   player.addComponent(spriteComponent);
   ```

3. **Zone Management**
   - Added Zone class for level management
   - Implemented ZoneManager singleton
   - Added zone state machine
   
   ```typescript
   // Create and switch to new zone
   const levelId = ZoneManager.createZone("Level1", "First Level");
   ZoneManager.changeZone(levelId);
   ```

4. **Transform System**
   - Implemented local and world space transforms
   - Added matrix hierarchy calculations
   - Created transform component
   
   ```typescript
   // Transform operations
   gameObject.transform.position.x = 100;
   gameObject.transform.rotation.z = Math.PI / 2;
   gameObject.transform.scale.x = 2;
   ```

5. **Resource Management**
   - Added scene-level resource tracking
   - Implemented component lifecycle management
   - Added hierarchy-based loading system
   
   ```typescript
   // Resources load through hierarchy
   scene.load();  // Loads all objects and components
   ```
### [PR:7 Component System & JSON Serialization](https://github.com/Cyrus-0101/koru-ts/pull/7)

This PR implements a robust component system with JSON serialization and zone management:

1. **Core Component Architecture**
   - Implemented `IComponent` interface for all game components
   - Created `BaseComponent` abstract class with lifecycle methods
   - Added component ownership tracking through `SimObject`
   ```typescript
   class HealthComponent extends BaseComponent {
       public update(time: number): void {
           // Custom update logic
       }
   }
   ```

2. **Component Factory System**
   - Created `IComponentBuilder` interface for JSON deserialization
   - Implemented `ComponentManager` singleton for builder registration
   - Added type-safe component instantiation from JSON
   ```typescript
   // Register builder
   ComponentManager.registerBuilder(new SpriteComponentBuilder());
   
   // Create from JSON
   const component = ComponentManager.extractComponent({
       type: "sprite",
       material: "player"
   });
   ```

3. **JSON Serialization System**
   - Added `setFromJson` methods to core math classes (Vector2/3, Transform)
   - Implemented `IComponentData` interface for serializable components
   - Created JSON asset loader with error handling
   ```typescript
   // Vector3 deserialization
   const vec = new Vector3();
   vec.setFromJson({ x: 1, y: 2, z: 3 });
   
   // Transform deserialization
   transform.setFromJson({
       position: { x: 10, y: 5 },
       rotation: { z: 45 }, // degrees
       scale: { x: 2, y: 2 }
   });
   ```

4. **Zone Management System**
   - Implemented recursive `loadSimObject` for hierarchical scene loading
   - Added zone state machine (UNINITIALIZED → LOADING → UPDATING)
   - Created JSON-based zone initialization
   ```typescript
   // Zone JSON structure
   {
       "id": 1,
       "name": "Forest",
       "objects": [{
           "name": "Player",
           "components": [{
               "type": "sprite",
               "material": "player"
           }]
       }]
   }
   ```

5. **Engine Integration**
   - Connected `AssetManager` with `ZoneManager` for resource loading
   - Implemented message-based zone transitions
   - Added initialization to engine startup
   ```typescript
   // Engine startup sequence
   start() {
       AssetManager.initiliaze();
       ZoneManager.initialize();
       ComponentManager.registerBuilder(new SpriteComponentBuilder());
       ZoneManager.changeZone(0); // Load first zone
   }
   ```

Key Features:
- Type-safe component creation from JSON
- Recursive scene graph construction
- Asynchronous zone loading
- Clean separation between data and behaviour
- Comprehensive error handling

> The system enables data-driven game object creation while maintaining type safety and providing clear lifecycle management.


### [PR:8 Behaviour System Implementation](https://github.com/Cyrus-0101/koru-ts/pull/8)

This PR implements a flexible behaviour system with JSON serialization and management:

1. **Core Behaviour Architecture**
   - Implemented `IBehaviour` interface for all game behaviours
   - Created `BaseBehaviour` abstract class with lifecycle methods
   - Added behaviour ownership tracking through `SimObject`
   ```typescript
   class RotationBehaviour extends BaseBehaviour {
       public update(time: number): void {
           this._owner.transform.rotation.add(this._rotation);
       }
   }
   ```

2. **Behaviour Factory System**
   - Created `IBehaviourBuilder` interface for JSON deserialization
   - Implemented `BehaviourManager` singleton for builder registration
   - Added type-safe behaviour instantiation from JSON
   ```typescript
   // Register builder
   BehaviourManager.registerBuilder(new RotationBehaviourBuilder());
   
   // Create from JSON
   const behaviour = BehaviourManager.extractBehaviour({
       type: "rotation",
       rotation: { x: 0, y: 1, z: 0 }
   });
   ```

3. **JSON Serialization Integration**
   - Added behaviour data classes implementing `IBehaviourData`
   - Implemented `setFromJson` for behaviour configuration
   - Created validation for required behaviour properties
   ```typescript
   // Behaviour data deserialization
   const data = new RotationBehaviourData();
   data.setFromJson({
       name: "spin",
       rotation: { x: 0, y: 2, z: 0 }
   });
   
   // JSON behaviour definition
   {
       "type": "rotation",
       "name": "coinSpin",
       "rotation": { "y": 5 }
   }
   ```

4. **Engine Integration**
   - Connected `BehaviourManager` with core engine systems
   - Implemented automatic builder registration
   ```typescript
   // Engine initialization
   start() {
      // ...existing code

       BehaviourManager.registerBuilder(new RotationBehaviourBuilder());
       // Additional system initialization
   }
   ```

### [PR:9 Animation & Input System Implementation](https://github.com/Cyrus-0101/koru-ts/pull/9)

This PR implements a comprehensive animation and input management system with component-based architecture:

1. **Animation System Core**

   * Created `AnimatedSprite` class extending `Sprite` with frame-by-frame animation
   * Implemented `IMessageHandler` for animation event communication
   * Refactored `Sprite` class to use extensible `Vertex` type system

```typescript
class DuckAnimation extends AnimatedSprite {
    public update(time: number): void {
        this.playAnimation("quack");
    }
}
```

2. **Component Architecture**

   * Built `AnimatedSpriteComponent` for entity animation management
   * Developed `KeyboardMovementBehaviour` for input-driven motion
   * Added `setData()` and `clearData()` methods for state management

```typescript
// Animation component registration
ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());

// Movement behaviour from JSON
const movement = BehaviourManager.extractBehaviour({
    type: "keyboardMovement",
    speed: 2.5
});
```

3. **Input Management System**

   * Implemented `InputManager` class for unified input handling
   * Added keyboard and mouse event listeners
   * Integrated input system with message bus

```typescript
// Input configuration
InputManager.registerKeyMap({
    "MoveUp": "KeyW",
    "MoveLeft": "KeyA",
    "MoveRight": "KeyD",
    "MoveDown": "KeyS"
});
```

4. **Engine Integration & Optimization**

   * Added update/render helper methods to streamline game loop
   * Implemented delta time handling in `MessageBus` and `ZoneManager`
   * Added texture blending for transparent backgrounds

```typescript
// Engine initialization
start() {
    InputManager.initialize();
    MessageBus.subscribe("MOUSE_CLICK", this);
    
    // Register animation builders
    ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());
}
```

5. **Asset Pipeline**

   * Added duck texture with transparent background
   * Created dedicated material for animated sprites
   * Implemented vertex-based rendering pipeline

```json
// Example animated sprite configuration
{
    "type": "animatedSprite",
    "material": "duck",
    "frameWidth": 64,
    "frameHeight": 64,
    "frameCount": 8,
    "frameSequence": [0,1,2,3,4,5,6,7]
}
```


### [PR:10 Collision System Implementation](https://github.com/Cyrus-0101/koru-ts/pull/10)

This PR introduces a comprehensive collision detection system with shape-based intersection testing and component architecture:

1. **Core Collision Components**

   * Created `CollisionComponent` class with builder pattern for JSON serialization
   * Implemented `IShape2D` interface as foundation for collision shapes
   * Developed `Rectangle2D` and `Circle2D` classes implementing intersection logic

```typescript
// Collision component registration
ComponentManager.registerBuilder(new CollisionComponentBuilder());

// Example collision configuration
const collision = new CollisionComponent({
    shape: "rectangle",
    width: 32,
    height: 32
});
```

2. **Shape Mathematics**

   * Implemented dynamic vertex calculation for shape transformations
   * Added distance calculation between vector points
   * Created origin-based collision detection system

```typescript
// Rectangle intersection check
const rect1 = new Rectangle2D(width, height);
const rect2 = new Rectangle2D(width, height);
const isColliding = rect1.intersects(rect2);
```

3. **Collision Management System**

   * Built `CollisionManager` class to handle game object collisions
   * Integrated collision system into engine update loop
   * Implemented optimized intersection algorithms

```typescript
// Collision system initialization
start() {
    CollisionManager.initialize();
    MessageBus.subscribe("COLLISION_EVENT", this);
}
```

4. **Vector Mathematics**

   * Added clone methods for Vector2 objects
   * Fixed distance calculation between vectors
   * Implemented helper methods for shape transformations

```typescript
// Vector operations
const v1 = new Vector2(10, 10);
const v2 = v1.clone();
const distance = Vector2.distance(v1, v2);
```

5. **JSON Configuration Support**

   * Added type-safe collision data serialization
   * Implemented builder pattern for component creation
   * Created test zone with collision configuration

```json
// Example collision configuration
{
    "type": "collision",
    "shape": "circle",
    "radius": 16,
    "offset": { "x": 0, "y": 0 }
}
```

6. **Engine Integration**

   * Refactored component directory structure
   * Added collision system to core update loop
   * Implemented origin calculation within shapes

```typescript
// Engine update loop
update(time: number) {
    CollisionManager.update(time);
    // ... other systems
}
```

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [MDN WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [WebGL Rendering Context](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)
- [WebGL Context](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
- [Shader Programs](https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram)
- [Buffer Objects](https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer)
- [Attribute Pointers](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)
