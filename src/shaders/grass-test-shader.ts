
import { NodeShader, NodeShaderOutput, Parameter } from "@hology/core/shader/shader";
import { rgb, standardMaterial } from "@hology/core/shader-nodes";
import { Color } from 'three';

export default class GrassTestShader extends NodeShader {
  @Parameter()
  color: Color = new Color(0x000000)

  output(): NodeShaderOutput {
    return {
      color: standardMaterial({color: rgb(this.color)})
    }
  } 

}
