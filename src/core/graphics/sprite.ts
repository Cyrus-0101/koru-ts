import { AttributeInfo, GLBuffer } from "../gl/glBuffer";

/**
 * Sprite class represents a 2D graphical object in the game
 * Handles:
 * - Vertex buffer creation and management
 * - Attribute configuration
 * - Drawing operations
 * - Size and position management
 */
export class Sprite {
  /** Unique identifier for this sprite */
  private _name: string;

  /** Width in pixels/units */
  private _width: number;

  /** Height in pixels/units */
  private _height: number;

  /**
   * Vertex Buffer Object (VBO) storing geometry data
   * Contains vertex positions for rendering
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer
   */
  private _buffer!: GLBuffer;

  /**
   * Creates a new sprite instance
   * @param name Unique identifier for this sprite
   * @param width Width in pixels/units (default: 10)
   * @param height Height in pixels/units (default: 10)
   */
  public constructor(name: string, width: number = 100, height: number = 100) {
    this._name = name;
    this._width = width;
    this._height = height;
  }

  /**
   * Initializes the sprite's graphics resources
   * - Creates vertex buffer
   * - Sets up attributes
   * - Uploads vertex data to GPU
   */
  public load(): void {
    // Create a new buffer object in GPU memory with 3 components per vertex (x,y,z)
    this._buffer = new GLBuffer(3);

    // Configure vertex position attribute for the shader
    let positionAttribute = new AttributeInfo();

    // Get location of a_position attribute from shader program
    positionAttribute.location = 0;

    // Set offset to 0 (start of vertex data)
    positionAttribute.offset = 0;

    // Each position has 3 components (x, y, z)
    positionAttribute.size = 3;

    // Register attribute with buffer for automatic setup during binding
    this._buffer.addAttributeLocation(positionAttribute);

    // Define quad vertices using two triangles
    // Counter-clockwise winding order for proper face culling
    let vertices = [
      // First triangle (bottom-left, top-left, top-right)
      0.0,
      0.0,
      0.0, // Vertex 1: bottom-left
      0.0,
      this._height,
      0.0, // Vertex 2: top-left
      this._width,
      this._height,
      0.0, // Vertex 3: top-right

      // Second triangle (top-right, bottom-right, bottom-left)
      this._width,
      this._height,
      0.0, // Vertex 4: top-right
      this._width,
      0.0,
      0.0, // Vertex 5: bottom-right
      0.0,
      0.0,
      0.0, // Vertex 6: bottom-left
    ];

    // Upload vertex data to GPU memory
    this._buffer.pushBackData(vertices);

    this._buffer.upload();

    // Unbind buffer to prevent accidental modifications
    this._buffer.unbind();
  }

  /**
   * Updates sprite state
   * @param time Current game time in milliseconds
   */
  public update(time: number): void {}

  /**
   * Renders the sprite using its vertex buffer
   */
  public draw(): void {
    // Bind buffer
    this._buffer.bind();
    // Draw quad
    this._buffer.draw();
  }
}
