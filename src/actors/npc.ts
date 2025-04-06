
import { Actor, AnimationState, AnimationStateMachine, AssetLoader, attach, BaseActor, inject, Parameter } from '@hology/core/gameplay';
import { CharacterAnimationComponent } from "@hology/core/gameplay/actors";
import { Mesh, MeshBasicMaterial, Object3D, SphereGeometry } from 'three';
import { DialogueStartComponent } from "../components/dialogue-start";
import { DialogueService, StoryCharacter } from '../services/dialogue-service';
import { setupCharacterModel } from './character';

@Actor()
class Npc extends BaseActor {

  public dialogueStart = attach(DialogueStartComponent)
  private animation = attach(CharacterAnimationComponent)

  public health: number = 50

  private dialogueService = inject(DialogueService)
  private assetLoader = inject(AssetLoader)

  private info?: StoryCharacter

  @Parameter()
  private model?: Object3D

  async onInit(): Promise<void> {
    if (this.model != null) {
      this.initModel()
    }
  }

  async setModelByAssetName(name: string) {
    const model = await this.assetLoader.getModelByAssetName(name)
    this.model = model?.scene
    this.initModel()
  }

  async initModel() {
    if (this.dialogueStart.objId != null) {
      this.info = this.dialogueService.getCharacter(this.dialogueStart.objId)
    }

    if (this.model == null) {
      this.model = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({color: this.dialogueStart.objId ? 'white' : 'red'}))
    } else {
      setupCharacterModel(this.model, this.info)
    }
    
    const animations = this.model.animations
    this.object.add(this.model)


    const clips = Object.fromEntries(animations.map(clip => [clip.name, clip]))  

    const idle = new AnimationState(clips['Rig|Idle'])
    
    const sm = new AnimationStateMachine(idle)

    this.animation.setup(this.model)
    this.animation.playStateMachine(sm)
  }

}

export default Npc
