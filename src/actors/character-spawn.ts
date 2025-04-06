


import { Actor, inject, Parameter } from "@hology/core/gameplay";
import { SpawnPoint } from "@hology/core/gameplay/actors";
import { DialogueService } from "../services/dialogue-service";
import Npc from "./npc";
import { firstValueFrom } from "rxjs";

@Actor()
class CharacterSpawnPoint extends SpawnPoint {

  private readonly dialogueService = inject(DialogueService)

  @Parameter()
  private objectId?: string

  async onBeginPlay(): Promise<void> {    
    await firstValueFrom(this.dialogueService.ready)
    if (this.objectId != null) {
      const spawnPointInfo = this.dialogueService.getSpawnPoint(this.objectId)
      const settings = this.dialogueService.getSettings()
      const characterInfo = spawnPointInfo?.character
      // Don't spawn if it references the player as it will be spawned with a different actor
      const isPlayer = settings?.playerCharacter != null && characterInfo != null && settings.playerCharacter.id === characterInfo.id
      if (characterInfo != null && !isPlayer) {
        const npc = await this.world.spawnActor(Npc, this.position, this.rotation)

        if (characterInfo.objectId == null) {
          console.error("Missing object_id property on character component")
          return 
        }
        npc.dialogueStart.objId = characterInfo.objectId

        if (characterInfo.asset == null) {
          console.error("Missing asset property on character component")
          return 
        }
        await npc.setModelByAssetName(characterInfo.asset)
      }
    }
  }

}

export default CharacterSpawnPoint
