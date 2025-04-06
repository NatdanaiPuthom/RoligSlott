
import { attributes, combineTransforms, dot, float, mix, normalize, rgb, sin, smoothstep, standardMaterial, textureSampler2d, timeUniforms, translateX, translateZ, varyingAttributes, vec2 } from "@hology/core/shader-nodes";
import { NodeShader, NodeShaderOutput, Parameter } from "@hology/core/shader/shader";
import { Color, Material, Texture } from 'three';

export default class LeavesShader extends NodeShader {
  @Parameter()
  color: Color = new Color(0x000000)

  @Parameter()
  colorTop: Color = new Color(0x000000)

  @Parameter()
  hasGradient: boolean = false

  @Parameter()
  gradientStart: number = 0

  @Parameter()
  gradientEnd: number = 1

  @Parameter()
  alphaMap: Texture = new Texture()

  @Parameter()
  windStrength: number = 15

  output(): NodeShaderOutput {
    
    const opacity = textureSampler2d(this.alphaMap).sample(varyingAttributes.uv).r

    const time = timeUniforms.elapsed
    const windDirection = normalize(vec2(-0.2, 0.9))
    
    const windEffect = sin(dot(attributes.position.xy, windDirection).multiply(10).add(time.multiply(2))).multiply(this.windStrength);

    const gradient = mix(rgb(this.color), rgb(this.colorTop), smoothstep(float(this.gradientStart), float(this.gradientEnd), varyingAttributes.position.y))

    const color = this.hasGradient 
      ? gradient
      : rgb(this.color)

    return {
      color: standardMaterial({color: color.rgba(opacity)}),
      transform: combineTransforms(
        translateX(windEffect),
        translateZ(windEffect.multiply(.5))
      ),
      alphaTest: 0.5
    }
  } 

  build(): Material {
    const mat = super.build()
    /** 
     * Custom shader normally require a custom depth material. 
     * However, we can utilize the default behavior by exposing the alpha map 
     * on the material.
     * However, it does not currently work with vertex transforms.
     * @ts-expect-error This property doesn't exist yet on  */
    mat.alphaMap = this.alphaMap
    return mat
  }

}
