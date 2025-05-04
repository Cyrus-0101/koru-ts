/**
 * Basic fragment shader
 * Outputs color from uniform
 */
export const fragmentShaderSource = `
precision mediump float;

uniform vec4 u_color;

void main() {
    gl_FragColor = u_color;
}`;
