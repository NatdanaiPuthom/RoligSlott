
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

export default class BoulderShader extends NodeShader {
  @Parameter()
  color: Color = new Color()
  

  
  @Parameter()
  normalMap: Texture = new Texture()
    

  output(): NodeShaderOutput {
   

  

   
    const worldCoord = varying(transformed.worldPosition.xy)
       const normalMap = textureSampler2d(this.normalMap)
       const normalSample = normalMap.sample(worldCoord.multiplyScalar(.005))
   
       const normal = colorToNormal(normalSample, 1)
      
    
    return {
      color: standardMaterial({color: rgb(this.color), normal, roughness: 0.1})
    }}
  }




