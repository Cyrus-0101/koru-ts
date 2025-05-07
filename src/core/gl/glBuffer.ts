import { gl } from "./gl";

/**
 * Represents information needed for a GLBuffer attribute
 * Used to define how vertex attributes are laid out in memory
 */
export class AttributeInfo {
  /**
   * Creates a new AttributeInfo instance
   * @param location Shader attribute location
   * @param size Number of components (e.g., 3 for vec3)
   * @param offset Byte offset from start of vertex
   */
  constructor(
    public location: number = 0,
    public size: number = 0,
    public offset: number = 0
  ) {}
}

/**
 * GLBuffer class handles WebGL buffer operations and management
 * Responsible for:
 * - Managing vertex and index buffers
 * - Handling different data types and their sizes
 * - Buffer creation and data upload to GPU
 * - Drawing operations
 *
 * WebGL References:
 * - https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer
 * - https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 */
export class GLBuffer {
  /** Number of components per vertex (e.g., 3 for vec3, 2 for vec2) */
  private _elementSize: number;

  /** Byte offset between consecutive vertex attributes */
  private _stride!: number;

  /** WebGL buffer object for storing vertex data */
  private _buffer!: WebGLBuffer;

  /** Buffer target (ARRAY_BUFFER for vertex data, ELEMENT_ARRAY_BUFFER for indices) */
  private _targetBufferType: number;

  /** Data type of components (FLOAT, INT, etc.) */
  private _dataType: number;

  /** Drawing mode (TRIANGLES, LINES, etc.) */
  private _mode: number;

  /** Size in bytes of the chosen data type */
  private _typeSize: number;

  /** Array holding the buffer data before upload to GPU */
  private _data: number[] = [];

  /** Indicates if attribute locations have been set for this buffer */
  private _hasAttributeLocation: boolean = false;

  /** Array of attribute information objects describing buffer layout */
  private _attributes: AttributeInfo[] = [];

  /**
   * Creates a new GL buffer with specified configuration
   * @param elementSize Size of each element in this buffer - Number of components per vertex (e.g., 3 for positions (x,y,z))
   * @param dataType Type of data (default=gl.FLOAT, gl.INT, etc.)
   * @param targetBufferType Buffer target type (default=gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER)
   * @param mode Drawing mode of this buffer (default=gl.TRIANGLES or gl.LINES, etc.)
   */
  public constructor(
    elementSize: number,
    dataType: number = gl.FLOAT,
    targetBufferType: number = gl.ARRAY_BUFFER,
    mode: number = gl.TRIANGLES
  ) {
    this._elementSize = elementSize;
    this._dataType = dataType;
    this._targetBufferType = targetBufferType;
    this._mode = mode;

    // Determine byte size
    // UNSIGNED is always a positive integer
    // SHORT is a 16bit number
    switch (this._dataType) {
      case gl.FLOAT:
      case gl.INT:
      case gl.UNSIGNED_INT:
        this._typeSize = 4;
        break;

      case gl.SHORT:
      case gl.UNSIGNED_SHORT:
        this._typeSize = 2;
        break;

      case gl.BYTE:
      case gl.UNSIGNED_BYTE:
        this._typeSize = 1;
        break;

      default:
        throw new Error(
          "ERROR: Unrecognized data type: " + dataType.toString()
        );
    }

    this._stride = this._elementSize * this._typeSize;
    this._buffer = gl.createBuffer();
  }

  /**
   * Destroys this buffer
   */
  public destroy(): void {
    gl.deleteBuffer(this._buffer);
  }

  /**
   * Binds this buffer and sets up vertex attributes
   * @param normalized Indicates if the data should be normalized. When true, integer data is normalized to [0,1] or [-1,1]. Default = false
   */
  public bind(normalized: boolean = false): void {
    // Bind this buffer to the currently active WebGL context
    gl.bindBuffer(this._targetBufferType, this._buffer);

    if (this._hasAttributeLocation) {
      // Configure each attribute's layout in memory
      for (let it of this._attributes) {
        // Set up vertex attribute pointer:
        // - location: Where in shader this attribute is bound
        // - size: Number of components per vertex
        // - dataType: Data type of each component
        // - normalized: Should data be normalized
        // - stride: Bytes between vertex starts
        // - offset: Bytes to first vertex
        gl.vertexAttribPointer(
          it.location,
          it.size,
          this._dataType,
          normalized,
          this._stride,
          it.offset * this._typeSize
        );

        // Enable this attribute in the vertex shader
        gl.enableVertexAttribArray(it.location);
      }
    }
  }

  /**
   * Unbinds this buffer
   */
  public unbind(): void {
    for (let it of this._attributes) {
      gl.disableVertexAttribArray(it.location);
    }

    gl.bindBuffer(this._targetBufferType, null);
  }

  /**
   * Adds an attribute with the provided information to this buffer
   * @param info The information to be added.
   */
  public addAttributeLocation(info: AttributeInfo): void {
    this._hasAttributeLocation = true;
    this._attributes.push(info);
  }

  /**
   * Adds data to this buffer
   * @param data
   */
  public pushBackData(data: number[]): void {
    for (let d of data) {
      this._data.push(d);
    }
  }

  /**
   * Uploads this buffer's data to the GPU
   */
  public upload(): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);

    let bufferData: ArrayBufferView;

    switch (this._dataType) {
      case gl.FLOAT:
        bufferData = new Float32Array(this._data);
        break;

      case gl.INT:
        bufferData = new Int32Array(this._data);
        break;

      case gl.UNSIGNED_INT:
        bufferData = new Uint32Array(this._data);
        break;

      case gl.SHORT:
        bufferData = new Uint16Array(this._data);
        break;

      case gl.UNSIGNED_SHORT:
        bufferData = new Uint16Array(this._data);
        break;

      case gl.BYTE:
        bufferData = new Int8Array(this._data);
        break;

      case gl.UNSIGNED_BYTE:
        bufferData = new Uint8Array(this._data);
        break;

      default:
        throw new Error(`ERROR: Unsupported data type: ${this._dataType}`);
    }

    gl.bufferData(this._targetBufferType, bufferData, gl.STATIC_DRAW);
  }

  /**
   * Draws the contents of this buffer
   * - For ARRAY_BUFFER, draws vertices directly
   * - For ELEMENT_ARRAY_BUFFER, draws indexed vertices
   */
  public draw(): void {
    if (this._targetBufferType === gl.ARRAY_BUFFER) {
      // Draw vertices directly:
      // - mode: How to interpret vertices (TRIANGLES, LINES, etc.)
      // - first: Starting vertex index
      // - count: Number of vertices to draw
      gl.drawArrays(this._mode, 0, this._data.length / this._elementSize);
    } else if (this._targetBufferType === gl.ELEMENT_ARRAY_BUFFER) {
      // Draw indexed vertices:
      // - mode: How to interpret vertices
      // - count: Number of indices to draw
      // - type: Data type of indices
      // - offset: Starting point in index buffer

      gl.drawElements(this._mode, this._data.length, this._dataType, 0);
    }
  }
}
