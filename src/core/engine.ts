import { gl, GLUtilities } from "./gl/gl";
import { AttributeInfo, GLBuffer } from "./gl/glBuffer";
import { Shader } from "./gl/shaders";

/**
 * KoruTSEngine - Core Game Engine Class
 *
 * Responsible for:
 * - Managing the game loop
 * - Handling WebGL context
 * - Managing shaders
 * - Controlling render pipeline
 * - Handling window resizing
 *
 * WebGL References:
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
 */
export class KoruTSEngine {
  /** Counter for tracking frame updates and performance monitoring */
  private _count: number = 0;

  /** Canvas element where WebGL context is created and rendering occurs */
  private _canvas!: HTMLCanvasElement;

  /**
   * Shader program containing vertex and fragment shaders
   * Handles transformation and coloring of geometry
   */
  private _shader!: Shader;

  /**
   * Vertex Buffer Object (VBO) storing geometry data
   * Contains vertex positions for rendering
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer
   */
  private _buffer!: GLBuffer;

  /**
   * Creates a new engine instance
   * Note: Actual initialization happens in start()
   */
  public constructor() {}

  /**
   * Initializes and starts the game engine
   * - Sets up WebGL context and canvas
   * - Configures initial render state and viewport
   * - Loads and compiles shader programs
   * - Creates vertex buffers
   * - Begins the render loop
   */
  public start(): void {
    // Initialize WebGL context and get canvas reference
    this._canvas = GLUtilities.initialize();

    // Set default background color to black (R=0, G=0, B=0, A=1)
    gl.clearColor(0, 0, 0, 1);

    // Load and activate shader programs for rendering
    this.loadShaders();
    this._shader.use();

    // Create and initialize vertex buffer with geometry data
    this.createBuffer();

    // Configure initial viewport and canvas size
    this.resize();

    // Start the main game loop
    this.loop();
  }

  /**
   * Main game loop - Heart of the engine
   * Executes every frame (typically 60fps) and handles:
   * 1. Clear previous frame's render
   * 2. Set up vertex attributes
   * 3. Bind buffers and configure attributes
   * 4. Draw geometry
   * 5. Schedule next frame
   */
  private loop(): void {
    // Clear the color buffer to remove previous frame
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set uniforms
    let colorPosition = this._shader.getUniformLocation("u_color");

    gl.uniform4f(colorPosition, 1, 0.5, 0, 1);

    this._buffer.bind();

    this._buffer.draw();

    // Schedule next frame using requestAnimationFrame
    // bind(this) ensures correct 'this' context in the callback
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Creates and initializes vertex buffer object (VBO)
   * Sets up a simple triangle in normalized device coordinates:
   * - Coordinates range from -1 to 1
   * - (0,0) is the center of the screen
   * - Each vertex has X, Y, Z components
   * - Counter-clockwise winding order for front-facing triangles
   */
  private createBuffer(): void {
    // Create a new buffer object in GPU memory with 3 components per vertex (x,y,z)
    this._buffer = new GLBuffer(3);

    // Configure vertex position attribute for the shader
    let positionAttribute = new AttributeInfo();

    // Get location of a_position attribute from shader program
    positionAttribute.location =
      this._shader.getAttributeLocation("a_position");

    // Set offset to 0 (start of vertex data)
    positionAttribute.offset = 0;

    // Each position has 3 components (x, y, z)
    positionAttribute.size = 3;

    // Register attribute with buffer for automatic setup during binding
    this._buffer.addAttributeLocation(positionAttribute);

    // Define triangle vertices in counter-clockwise order
    // Using normalized device coordinates (-1 to +1)
    let vertices = [
      // x,    y,    z
      0.0,
      0.0,
      0.0, // Vertex 1: bottom-left - Element Buffer
      0.0,
      0.5,
      0.0, // Vertex 2: top-left
      0.5,
      0.5,
      0.0, // Vertex 3: top-right
    ];

    // Upload vertex data to GPU memory
    this._buffer.pushBackData(vertices);

    this._buffer.upload();

    // Unbind buffer to prevent accidental modifications
    this._buffer.unbind();
  }

  /**
   * Handles window resize events
   * Adjusts canvas size to match window dimensions for proper display
   */
  public resize(): void {
    if (this._canvas !== undefined) {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;

      // Normalized Device coordinates - how webGL represents triangles
      gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  /**
   * Sets up basic shader programs
   * Creates and compiles:
   * - Vertex shader: Handles vertex positions
   * - Fragment shader: Sets pixel colors
   */
  private loadShaders(): void {
    // Basic vertex shader that transforms positions
    let vertexShaderSource = `
attribute vec3 a_position;

void main() {
    gl_Position = vec4(a_position, 1.0);
}`;

    // Basic fragment shader that outputs white color
    let fragmentShaderSource = `
precision mediump float;

uniform vec4 u_color;

void main() {
    gl_FragColor = u_color;
}
`;

    // Create new shader program with both shaders
    this._shader = new Shader(
      "basic",
      vertexShaderSource,
      fragmentShaderSource
    );
  }
}
