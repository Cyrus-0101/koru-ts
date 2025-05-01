import { gl } from "./gl";

/**
 * Shader class handles the compilation and management of WebGL shader programs
 * Shaders are small programs that run on the GPU and determine how objects are rendered
 *
 * Two main types of shaders:
 * 1. Vertex Shader: Processes vertex data (positions, normals, etc.)
 *    - Transforms 3D coordinates into 2D screen coordinates
 *    - Handles vertex-level calculations (position, lighting, etc.)
 *
 * 2. Fragment Shader (Pixel Shader): Processes pixel-level data
 *    - Determines the final color of each pixel
 *    - Handles texturing, lighting calculations, and effects
 */
export class Shader {
  /** Name identifier for the shader program */
  private _name: string;

  /** WebGL program object that combines vertex and fragment shaders */
  private _program!: WebGLProgram;

  /** HashMap with values for our attributes default {} */
  private _attributes: { [name: string]: number } = {};

  private _uniforms: { [name: string]: WebGLUniformLocation | null } = {};

  /**
   * Creates a new shader program
   * @param name Identifier for the shader program
   * @param vertexSource GLSL source code for the vertex shader
   * @param fragmentSource GLSL source code for the fragment shader
   */
  public constructor(
    name: string,
    vertexSource: string,
    fragmentSource: string
  ) {
    this._name = name;
    // Compile both vertex and fragment shaders
    let vertexShader = this.loadShader(vertexSource, gl.VERTEX_SHADER);
    let fragmentShader = this.loadShader(fragmentSource, gl.FRAGMENT_SHADER);

    // Create and link the shader program
    this.createProgram(vertexShader, fragmentShader);

    this.detectAttributes();

    this.detectUniforms();
  }

  /**
   * Gets the name of the shader program
   * @returns The shader program's identifier
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Activates this shader program for rendering
   * Makes this shader the active program in the WebGL context
   */
  public use(): void {
    gl.useProgram(this._program);
  }

  /**
   * Gets the location of an attribute with the provided name.
   * @param name - The name of the attribute location to retrieve
   * @returns number -
   */
  public getAttributeLocation(name: string): number {
    if (this._attributes[name] === undefined) {
      throw new Error(
        `Unable to find attribute named '${name}' in shader '${this._name}'`
      );
    }

    return this._attributes[name];
  }

  /**
   * Gets the location of a uniform with the provided name
   * @param name The name of the uniform to retrieve
   * @returns WebGLUniformLocation or null if not found
   */
  public getUniformLocation(name: string): WebGLUniformLocation | null {
    if (this._uniforms[name] === undefined) {
      throw new Error(
        `Unable to find uniform named '${name}' in shader '${this._name}'`
      );
    }
    return this._uniforms[name];
  }

  /**
   * Loads and compiles a shader from source code
   * @param source GLSL source code for the shader
   * @param shaderType Type of shader (vertex or fragment)
   * @returns Compiled WebGL shader object
   * @throws Error if shader creation or compilation fails
   */
  private loadShader(source: string, shaderType: number): WebGLShader {
    // Create a new shader object
    let shader = gl.createShader(shaderType);
    if (!shader) {
      throw new Error("Unable to create shader");
    }

    // Set the shader source code and compile it
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check for compilation errors
    let error = gl.getShaderInfoLog(shader);
    if (error !== "") {
      throw new Error("Error compiling shader: " + this._name + ": " + error);
    }

    return shader;
  }

  /**
   * Creates and links a WebGL program from compiled shaders
   * @param vertexShader Compiled vertex shader
   * @param fragmentShader Compiled fragment shader
   * @throws Error if program linking fails
   */
  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): void {
    // Create a new WebGL program
    this._program = gl.createProgram();

    // Attach both shaders to the program
    gl.attachShader(this._program, vertexShader);
    gl.attachShader(this._program, fragmentShader);

    // Link the program
    gl.linkProgram(this._program);

    // Check for linking errors
    let error = gl.getProgramInfoLog(this._program);
    if (error !== "") {
      throw new Error("Error linking shader: " + this._name + ": " + error);
    }
  }

  /**
   * Detects and stores all active attributes in the shader program
   * Called during initialization to cache attribute locations for faster access
   *
   * WebGL References:
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getProgramParameter
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveAttrib
   * @private
   */
  private detectAttributes(): void {
    // Get the number of active attributes in the shader program
    let attributeCount = gl.getProgramParameter(
      this._program,
      gl.ACTIVE_ATTRIBUTES
    );

    // Iterate through all active attributes
    for (let i = 0; i < attributeCount; i++) {
      // Get information about the attribute at index i
      let info = gl.getActiveAttrib(this._program, i);

      if (!info) {
        break;
      }

      // Store the attribute location in our map for quick lookup
      // getAttribLocation returns the bound location of the attribute
      this._attributes[info.name] = gl.getAttribLocation(
        this._program,
        info.name
      );
    }
  }

  /**
   * Detects and stores all active uniforms in the shader program
   * Uniforms are global GLSL variables that remain constant across all vertices
   * Common uses: transformation matrices, lighting parameters, time variables
   *
   * WebGL References:
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getProgramParameter
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveUniform
   * @private
   */
  private detectUniforms(): void {
    // Get the number of active uniforms in the shader program
    let uniformCount = gl.getProgramParameter(
      this._program,
      gl.ACTIVE_UNIFORMS
    );

    // Iterate through all active uniforms
    for (let i = 0; i < uniformCount; i++) {
      // Get information about the uniform at index i
      let info = gl.getActiveUniform(this._program, i);

      if (!info) {
        break;
      }

      // Store the uniform location in our map for quick lookup
      // getUniformLocation returns the storage location of the uniform
      this._uniforms[info.name] = gl.getUniformLocation(
        this._program,
        info.name
      );
    }
  }
}
