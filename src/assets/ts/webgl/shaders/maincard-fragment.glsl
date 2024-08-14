precision mediump float;

uniform float uAlpha;
uniform float uAspect;
uniform float uTextureAspect;


#include "./utils/optimizeUv.glsl"

uniform sampler2D uTexture;

varying vec2 vUv;

void main() {

  vec2 uv = optimizationTextureUv(vUv, uAspect, uTextureAspect);

  vec3 color = texture2D(uTexture, uv).rgb;

  float threshold = 0.1;
  float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));

  float alpha = luminance < threshold ? 0.0 : uAlpha;

  // color = vec3(1.0, 0.0, 0.0);

  gl_FragColor = vec4(color, alpha);
}
