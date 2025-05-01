import { AttributeInfo, GLBuffer } from "../gl/glBuffer";

export class Sprite {
  private _name: string;
  private _width: number;
  private _height: number;

  /**
   * Vertex Buffer Object (VBO) storing geometry data
   * Contains vertex positions for rendering
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer
   */
  private _buffer!: GLBuffer;

  public constructor(name: string, width: number = 10, height: number = 10) {
    this._name = name;
    this._width = width;
    this._height = height;
  }

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

      // Drawing another triangle to draw a quad
      0.5,
      0.5,
      0.0,
      0.5,
      0.0,
      0.0,
      0.0,
      0.0,
      0.0,
    ];

    // Upload vertex data to GPU memory
    this._buffer.pushBackData(vertices);

    this._buffer.upload();

    // Unbind buffer to prevent accidental modifications
    this._buffer.unbind();
  }

  public update(time: number): void {}

  public draw(): void {
    this._buffer.bind();

    this._buffer.draw();
  }
}
