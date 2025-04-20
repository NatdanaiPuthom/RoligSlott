import {
  colorToNormal,
  edgeDepthEffect,
  mix,
  oneMinus,
  pow,
  rgb,
  rgba,
  Sampler2DNode,
  standardMaterial,
  textureSampler2d,
  timeUniforms,
  transformed,
  varying,
  vec2,
  Vec2Node,
} from "@hology/core/shader-nodes"
import {
  NodeShader,
  NodeShaderOutput,
  Parameter,
} from "@hology/core/shader/shader"
import { Color, Texture } from "three"

export default class WaterShader extends NodeShader {
  @Parameter()
  color: Color = new Color()

  @Parameter()
  shallowColor: Color = new Color()

  @Parameter()
  normalMap: Texture = new Texture()

  output(): NodeShaderOutput {
    const depth = edgeDepthEffect(4)

    const gradient = mix(rgb(this.color), rgb(this.shallowColor), depth)

    const opacity = oneMinus(pow(depth, 1.2))

    const color = rgba(gradient, opacity)

    const worldCoord = varying(transformed.worldPosition.xz)

    const normalMap = textureSampler2d(this.normalMap)
    const normalSample1 = sampleWaveNormal(
      normalMap,
      worldCoord,
      0.01,
      vec2(-0.4, 0.9),
      1
    )
    const normalSample2 = sampleWaveNormal(
      normalMap,
      worldCoord,
      0.02,
      vec2(0.5, 0.2),
      0.4
    )
    const normal = colorToNormal(mix(normalSample1, normalSample2, 0.5), 1)

    return {
      color: standardMaterial({ color, normal, roughness: 0.15 }),
    }
  }
}

function sampleWaveNormal(
  map: Sampler2DNode,
  coord: Vec2Node,
  scale: number,
  direction: Vec2Node,
  speed: number
) {
  const offset = direction.multiplyScalar(timeUniforms.elapsed.multiply(speed))
  return map.sample(coord.add(offset).multiplyScalar(scale))
}
