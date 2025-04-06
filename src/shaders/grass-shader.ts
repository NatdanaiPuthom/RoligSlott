

import { SimplexNoiseNode, attributes, float, lambertMaterial, mix, rgb, rgba, smoothstep, textureSampler2d, timeUniforms, transformed, translateX, uniforms, varyingAttributes, varyingFloat, vec2, vec4 } from "@hology/core/shader-nodes";
import { NodeShader, NodeShaderOutput, Parameter } from "@hology/core/shader/shader";
import { Color, Texture } from "three";

export default class GrassShader extends NodeShader {
  @Parameter()
  color?: Color

  @Parameter()
  colorBottom?: Color

  @Parameter()
  alphaMap?: Texture

  @Parameter()
  swayAmount: number = 1

  @Parameter()
  swaySpeed: number = 0.2

  output(): NodeShaderOutput {
    const distanceFromCamera = transformed.mvPosition.z.multiply(float(-1))
    const distanceAlpha = varyingFloat(smoothstep(float(1000), float(60) , distanceFromCamera))    

    const tipColor = rgb(this.color ?? 0xffffff)
    
    const gradientColor = mix(
      tipColor,
      rgb(this.colorBottom!),
      varyingAttributes.uv.y
    )

    const alpha = this.alphaMap != null 
      ? textureSampler2d(this.alphaMap).sample(varyingAttributes.uv.multiply(vec2(1, -1))).r
      : float(1)

    const lambertColor = lambertMaterial({color: gradientColor}).rgb

    const offsetFactor = this.swayAmount ?? 1
    const worldPosition = uniforms.instanceMatrix.multiplyVec(vec4(attributes.position, float(1)))
    const noiseAnimatedOffset = vec2(1,1).multiplyScalar(timeUniforms.elapsed.multiply(0.5))

    const noise = new SimplexNoiseNode(worldPosition.xz.add(noiseAnimatedOffset).multiplyScalar(this.swaySpeed))

    return {
      color: rgba(lambertColor, alpha.multiply(distanceAlpha)),
      transform: translateX(float(offsetFactor).multiply(noise).multiply(float(1).subtract(attributes.uv.y))),
      alphaTest: 0.8
    }
  }
}
