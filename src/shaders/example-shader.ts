import { rgb, standardMaterial } from "@hology/core/shader-nodes";
import { NodeShader, NodeShaderOutput, Parameter } from "@hology/core/shader/shader";
import { Color } from "three";

export class ExampleShader extends NodeShader {
  @Parameter()
  color: Color = new Color(0x000000)

  output(): NodeShaderOutput {
    return {
      color: standardMaterial({color: rgb(this.color)})
    }
  }
}

export default ExampleShader
