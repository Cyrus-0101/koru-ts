import { gl } from "../gl/gl";
import { AttributeInfo, GLBuffer } from "../gl/glBuffer";
import type { Shader } from "../gl/shaders";
import { Matrix4x4 } from "../math/matrix4x4";
import { Vector3 } from "../math/vector3";
import { Material } from "./material";
import { MaterialManager } from "./materialManager";
import { Vertex } from "./vertex";

/**
 * Sprite - 2D textured quad renderer with material support
 *
 * Features:
 * - Material-based rendering
 * - Vertex buffer management
 * - Position transformation
 * - UV coordinate mapping
 * - Reference-counted textures
 *
 * Memory Layout (per vertex):
 * - Position: vec3 (x, y, z) offset: 0
 * - TexCoord: vec2 (u, v)    offset: 3
 *
 * Shader Requirements:
 * Uniforms:
 * - u_model: Model transformation matrix - mat4       // Model transformation
 * - u_tint: Color tint (vec4)            - vec4       // Material Color Tint
 * - u_diffuse: Texture sampler           - sampler2D  // Texture Unit 0
 *
 * Attributes:
 * - a_position: vec3  // location 0
 * - a_texCoord: vec2  // location 1
 */
export class Sprite {
  /** Unique identifier for this sprite instance */
  protected _name: string;

  /** Width in pixels/units */
  protected _width: number;

  /** Height in pixels/units */
  protected _height: number;

  /** GPU vertex buffer containing positions and UVs */
  protected _buffer!: GLBuffer;

  /** Reference to material for rendering */
  protected _material: Material | undefined;

  /** Identifier for material lookup */
  protected _materialName: string | undefined;

  protected _vertices: Vertex[] = [];

  protected _origin: Vector3 = Vector3.zero;

  /**
   * Creates a new sprite instance
   * @param name Unique identifier for this sprite
   * @param materialName The name of the material to use with the sprite
   * @param width Width in pixels/units (default: 100)
   * @param height Height in pixels/units (default: 100)
   */
  public constructor(
    name: string,
    materialName: string,
    width: number = 100,
    height: number = 100
  ) {
    this._name = name;
    this._width = width;
    this._height = height;

    this._materialName = materialName;

    this._material = MaterialManager.getMaterial(this._materialName);
  }

  /**
   * Initializes sprite geometry and GPU resources
   * - Creates vertex buffer with interleaved data
   * - Sets up attribute pointers for shader
   * - Uploads quad geometry with UVs
   * - Configures winding order for face culling
   */
  public load(): void {
    // Create a new buffer object in GPU memory with 3 components per vertex (x,y,z)
    this._buffer = new GLBuffer();

    // Configure vertex position attribute for the shader
    let positionAttribute = new AttributeInfo();

    // Get location of a_position attribute from shader program
    positionAttribute.location = 0;

    // Each position has 3 components (x, y, z)
    positionAttribute.size = 3;

    // Register attribute with buffer for automatic setup during binding
    this._buffer.addAttributeLocation(positionAttribute);

    let texCoordAttributes = new AttributeInfo();

    texCoordAttributes.location = 1;

    // Each position has 3 components (U, V or x, y)
    texCoordAttributes.size = 2;

    // Register attribute with buffer for automatic setup during binding
    this._buffer.addAttributeLocation(texCoordAttributes);

    this.calculateVertices();
  }

  /**
   * Gets the sprite's unique identifier
   * @returns The sprite's name
   */
  public get name(): string {
    return this._name;
  }

  public get origin(): Vector3 {
    return this._origin;
  }

  public set origin(value: Vector3) {
    this._origin = value;
    this.calculateVertices();
  }

  /**
   * Cleans up sprite resources
   * - Destroys vertex buffer in GPU Memory
   * - Releases material reference
   * - Clears material references
   *
   * Should be called when sprite is no longer needed
   */
  public destroy(): void {
    this._buffer.destroy();
    MaterialManager.releaseMaterial(this._materialName!);

    this._material = undefined;
    this._materialName = undefined;
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
   * Renders sprite using provided shader
   *
   * Pipeline:
   * 1. Update model matrix with position
   * 2. Set material color tint
   * 3. Bind diffuse texture to unit 0
   * 4. Configure texture sampler
   * 5. Draw vertex buffer
   *
   * @param shader Shader to use for rendering
   */
  public draw(shader: Shader, model: Matrix4x4): void {
    // Update model matrix with current position
    let modelLocation = shader.getUniformLocation("u_model");
    gl.uniformMatrix4fv(
      // Translate Z
      modelLocation,
      false,
      model.toFloat32Array()
    );

    // Set color tint (currently orange)
    let colorLocation = shader.getUniformLocation("u_tint");

    gl.uniform4fv(
      colorLocation,
      this._material?.tint?.toFloat32Array() ?? new Float32Array([1, 0.5, 0, 1])
    ); // Default to orange if no material/tint

    if (this._material?.diffuseTexture !== undefined) {
      // Activate and bind texture for this sprite
      this._material.diffuseTexture.activateAndBind(0);

      // u_diffuse in fragment shader samples from this unit
      let diffuseLocation = shader.getUniformLocation("u_diffuse");
      gl.uniform1i(diffuseLocation, 0);
    }

    // Bind buffer
    this._buffer.bind();

    // Draw quad
    this._buffer.draw();
  }

  protected calculateVertices(): void {
    let minX = -(this._width * this.origin.x);

    let maxX = this._width * (1.0 - this._origin.x);

    let minY = -(this._height * this.origin.y);

    let maxY = this._height * (1.0 - this._origin.y);

    // Define quad vertices using two triangles
    // Counter-clockwise winding order for proper face culling
    this._vertices = [
      // First triangle (bottom-left, top-left, top-right - x,y,z)  (U, V)
      new Vertex(
        minX,
        minY,
        0.0, // Vertex 1: bottom-left
        0.0,
        0.0
      ),
      new Vertex(
        minX,
        maxY,
        0.0, // Vertex 2: top-left
        0.0,
        1.0
      ),
      new Vertex(
        maxX,
        maxY,
        0.0, // Vertex 3: top-right
        1.0,
        1.0
      ),

      // Second triangle (top-right, bottom-right, bottom-left)

      new Vertex(
        maxX,
        maxY,
        0.0, // Vertex 4: top-right
        1.0,
        1.0
      ),
      new Vertex(
        maxX,
        minY,
        0.0, // Vertex 5: bottom-right
        1.0,
        0.0
      ),
      new Vertex(
        minX,
        minY,
        0.0, // Vertex 6: bottom-left
        0.0,
        0.0
      ),
    ];

    // Upload vertex data to GPU memory
    for (let v of this._vertices) {
      this._buffer.pushBackData(v.toArray());
    }

    this._buffer.upload();

    // Unbind buffer to prevent accidental modifications
    this._buffer.unbind();
  }

  /**
   * Recalculates the position of all the vertices
   */
  protected recalculateVertices(): void {
    let minX = -(this._width * this.origin.x);

    let maxX = this._width * (1.0 - this._origin.x);

    let minY = -(this._height * this.origin.y);

    let maxY = this._height * (1.0 - this._origin.y);

    // First triangle (bottom-left, top-left, top-right - x,y,z)  (U, V)
    this._vertices[0].position.set(minX, minY);
    this._vertices[1].position.set(minX, maxY);
    this._vertices[2].position.set(maxX, maxY);
    // Second triangle (top-right, bottom-right, bottom-left)

    this._vertices[3].position.set(maxX, maxY);
    this._vertices[4].position.set(maxX, minY);
    this._vertices[5].position.set(minX, minY);

    this._buffer.clearData();

    // Upload vertex data to GPU memory
    for (let v of this._vertices) {
      this._buffer.pushBackData(v.toArray());
    }

    this._buffer.upload();

    // Unbind buffer to prevent accidental modifications
    this._buffer.unbind();
  }
}
