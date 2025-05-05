import { gl } from "../gl/gl";
import { AttributeInfo, GLBuffer } from "../gl/glBuffer";
import type { Shader } from "../gl/shaders";
import { Matrix4x4 } from "../math/matrix4x4";
import { Vector3 } from "../math/vector3";
import { Texture } from "./texture";
import { TextureManager } from "./textureManager";

/**
 * Sprite - 2D textured quad renderer
 *
 * Features:
 * - Vertex buffer management
 * - Texture coordinate mapping
 * - Position transformation
 * - Color tinting support
 * - Reference-counted textures
 *
 * Memory Layout (per vertex):
 * - Position: vec3 (x, y, z)
 * - TexCoord: vec2 (u, v)
 *
 * Uniforms:
 * - u_model: Model transformation matrix
 * - u_tint: Color tint (vec4)
 * - u_diffuse: Texture sampler
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

  /** Position in world space */
  public position: Vector3 = new Vector3();

  /** Texture instance for this sprite */
  private _texture: Texture;

  /** Name/path of the texture resource */
  private _textureName: string;

  /**
   * Creates a new sprite instance
   * @param name Unique identifier for this sprite
   * @param textureName The name of the texture to use with the sprite
   * @param width Width in pixels/units (default: 100)
   * @param height Height in pixels/units (default: 100)
   */
  public constructor(
    name: string,
    textureName: string,
    width: number = 100,
    height: number = 100
  ) {
    this._name = name;
    this._width = width;
    this._height = height;

    this._textureName = textureName;
    this._texture = TextureManager.getTexture(this._textureName);
  }

  /**
   * Initializes sprite graphics resources
   *
   * Creates and configures:
   * - Vertex buffer with positions and UVs
   * - Attribute layouts for shader
   * - Quad geometry with texture coordinates
   */
  public load(): void {
    // Create a new buffer object in GPU memory with 3 components per vertex (x,y,z)
    this._buffer = new GLBuffer(5);

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

    let texCoordAttributes = new AttributeInfo();

    texCoordAttributes.location = 1;

    texCoordAttributes.offset = 3;

    // Each position has 3 components (U, V or x, y)
    texCoordAttributes.size = 2;

    // Register attribute with buffer for automatic setup during binding
    this._buffer.addAttributeLocation(texCoordAttributes);

    // Define quad vertices using two triangles
    // Counter-clockwise winding order for proper face culling
    let vertices = [
      // First triangle (bottom-left, top-left, top-right - x,y,z)  (U, V)
      0.0,
      0.0,
      0.0, // Vertex 1: bottom-left
      0.0,
      0.0,
      0.0,
      this._height,
      0.0, // Vertex 2: top-left
      0.0,
      1.0,
      this._width,
      this._height,
      0.0, // Vertex 3: top-right
      1.0,
      1.0,

      // Second triangle (top-right, bottom-right, bottom-left)
      this._width,
      this._height,
      0.0, // Vertex 4: top-right
      1.0,
      1.0,
      this._width,
      0.0,
      0.0, // Vertex 5: bottom-right
      1.0,
      0.0,
      0.0,
      0.0,
      0.0, // Vertex 6: bottom-left
      0.0,
      0.0,
    ];

    // Upload vertex data to GPU memory
    this._buffer.pushBackData(vertices);

    this._buffer.upload();

    // Unbind buffer to prevent accidental modifications
    this._buffer.unbind();
  }

  /**
   * Gets the sprite's unique identifier
   * @returns The sprite's name
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Cleans up sprite resources
   * - Destroys vertex buffer
   * - Releases texture reference
   *
   * Should be called when sprite is no longer needed
   */
  public destroy(): void {
    this._buffer.destroy();
    TextureManager.releaseTexture(this._textureName);
  }

  /**
   * Updates routines on sprite state
   * Called each frame by the game engine
   *
   * @param time Current game time in milliseconds
   *
   * TODO: Add animation and movement updates
   */
  public update(time: number): void {}

  /**
   * Renders sprite with current transform and texture
   *
   * Pipeline:
   * 1. Update model matrix uniform (position)
   * 2. Set color tint uniform
   * 3. Bind texture to unit 0
   * 4. Set texture sampler uniform
   * 5. Bind and draw vertex buffer
   *
   * @param shader Shader program to use for rendering
   */
  public draw(shader: Shader): void {
    // Update model matrix with current position
    let modelLocation = shader.getUniformLocation("u_model");
    gl.uniformMatrix4fv(
      // Translate Z
      modelLocation,
      false,
      new Float32Array(Matrix4x4.translation(this.position).data)
    );

    // Set color tint (currently orange)
    let colorLocation = shader.getUniformLocation("u_tint");
    gl.uniform4f(colorLocation, 1, 0.5, 0, 1); // Orange color

    // Activate and bind texture for this sprite
    this._texture.activateAndBind(0);

    // u_diffuse in fragment shader samples from this unit
    let diffuseLocation = shader.getUniformLocation("u_diffuse");
    gl.uniform1i(diffuseLocation, 0);

    // Bind buffer
    this._buffer.bind();

    // Draw quad
    this._buffer.draw();
  }
}
