/**
 * Basic fragment shader
 * Outputs color from uniform
 */
export const fragmentShaderSource = `
precision mediump float;

uniform vec4 u_tint;

uniform sampler2D u_diffuse;

varying vec2 v_texCoord;

void main() {
    gl_FragColor = u_tint * texture2D(u_diffuse, v_texCoord);
}`;
