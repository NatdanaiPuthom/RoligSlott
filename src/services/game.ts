import { Service, GameInstance, inject, PhysicsSystem, World, ViewController } from '@hology/core/gameplay';
import { SpawnPoint } from '@hology/core/gameplay/actors';
import Character from '../actors/character';
import PlayerController from './player-controller';
import { DialogueService } from './dialogue-service';
import CharacterSpawnPoint from '../actors/character-spawn';
import { Audio, AudioLoader } from 'three'

@Service()
class Game extends GameInstance {
  private world = inject(World)
  private playerController = inject(PlayerController)
  private physics = inject(PhysicsSystem)
  private dialogueService = inject(DialogueService)
  private view = inject(ViewController)

  private musicAudio = new Audio(this.view.audioListener);

  async onStart() {
    this.physics.showDebug = false

    await this.dialogueService.init()

    const spawnPoint = this.world.actors.find(a => a instanceof SpawnPoint && !(a instanceof CharacterSpawnPoint)) as SpawnPoint
    const character = await spawnPoint.spawnActor(Character)
    this.playerController.setup(character)

    try {
      await this.startMusic(this.musicAudio)
    } catch (e) {
      console.error("Failed playing music", e)
    }
    
  }

  private async startMusic(sound: Audio) {
  
      if (sound.isPlaying) {
          sound.stop()
      }
      const audioLoader = new AudioLoader();
      const buffer = await audioLoader.loadAsync('Pleasant Creek Loop.wav')
      sound.setBuffer(buffer)
      sound.setLoop(true)
      sound.setVolume(0.2)
      sound.play()
  }

  onShutdown(): void | Promise<void> {
      this.musicAudio.stop()
  }
}

export default Game
