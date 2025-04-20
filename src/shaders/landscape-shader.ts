
import { NodeShader, NodeShaderOutput, Parameter } from "@hology/core/shader/shader";
import {
  colorToNormal,
  edgeDepthEffect,
  mix,
  
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

import { Color, Texture } from 'three';

export default class LandScapeShader extends NodeShader {
  @Parameter()
  color: Color = new Color()

  @Parameter()
  shallowColor: Color = new Color()

  @Parameter()
  normalMap: Texture = new Texture()
  

  @Parameter()
  alpha: number = 0.5 // Default transparency

  output(): NodeShaderOutput {
  

   
    const worldCoord = varying(transformed.worldPosition.xz)
       const normalMap = textureSampler2d(this.normalMap)
       const normalSample = normalMap.sample(worldCoord)
   
       const normal = colorToNormal(normalSample.multiplyScalar(.7), 1)
      
    
    return {
      color: standardMaterial({color: rgb(this.color.multiplyScalar(1.2)), normal, roughness: 0.85})
    }}
  }




