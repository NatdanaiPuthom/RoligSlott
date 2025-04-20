
import { Actor, AnimationState, AnimationStateMachine, AssetLoader, BaseActor, RootMotionClip, attach, inject, PhysicsSystem, World, Parameter, ActorComponent, ViewController } from "@hology/core/gameplay";
import { CharacterAnimationComponent, CharacterMovementComponent, CharacterMovementMode, ThirdPersonCameraComponent } from "@hology/core/gameplay/actors";
import { firstValueFrom } from 'rxjs';
import { FrontSide, Material, Mesh, Object3D } from "three";
import { DialogueService, StoryCharacter } from "../services/dialogue-service";

import PickUp from "./pick-up";

class ScoreComponent extends ActorComponent {
    @Parameter()
    currentPoints = 0

    update(change: number) {
        this.currentPoints += change;
    }
}

@Actor()
class Character extends BaseActor {

    private animation = attach(CharacterAnimationComponent)
    private physicsSystem = inject(PhysicsSystem)
    private world = inject(World)
    private view = inject(ViewController)

    private sound = new THREE.Audio(this.view.audioListener);
    score = attach(ScoreComponent)

    public readonly movement = attach(CharacterMovementComponent, {
        maxSpeed: 8,
        maxSpeedSprint: 14,
        maxSpeedBackwards: 8,
        snapToGround: 0.1,
        autoStepMinWidth: 0.2,
        autoStepMaxHeight: 0.4,
        fallingReorientation: true,
        fallingMovementControl: 0.2,
        colliderHeight: 1.8,
        colliderRadius: 0.75,
        jumpVelocity: 12.5,
        offset: 0.01,
        gravityOverride: -30,
        rotateToMovementDirection: true,
        smoothRotation: true,
    })

    public readonly thirdPersonCamera = attach(ThirdPersonCameraComponent, {
        height: 1.9,
        offsetX: 0,
        offsetZ: 0,
        minDistance: 11,
        maxDistance: 11,
        distance: 11,
        fixedBehind: false
    })

    private assetLoader = inject(AssetLoader)
    private dialogueService = inject(DialogueService)

    async onInit(): Promise<void> {
        this.thirdPersonCamera.camera.far = 2000
        this.thirdPersonCamera.camera.updateProjectionMatrix()

        await firstValueFrom(this.dialogueService.ready)
        const storySettings = this.dialogueService.getSettings()

        const { scene, animations } = await this.assetLoader.getModelByAssetName(storySettings?.playerCharacter?.asset ?? 'Butler_Anim')
        this.object.add(scene)

        setupCharacterModel(scene, storySettings?.playerCharacter)

        const clips = Object.fromEntries(animations.map(clip => [clip.name, clip]))
        const walkingClip = clips['Rig|Walking_C'] ?? clips['Rig|Walking']

        const idle = new AnimationState(clips['Rig|Idle'])
        const walk = new AnimationState(walkingClip && RootMotionClip.fromClipWithDistance(walkingClip, 3))
        const jump = new AnimationState(clips['Rig|Jump_Idle'])
        const sprint = new AnimationState(clips['Running '])

        idle.transitionsBetween(walk, () => this.movement.horizontalSpeed > 0)
        walk.transitionsBetween(sprint, () => this.movement.isSprinting)
        sprint.transitionsTo(idle, () => this.movement.horizontalSpeed == 0)

        for (const state of [idle, walk, sprint]) {
            state.transitionsBetween(jump, () => this.movement.mode === CharacterMovementMode.falling)
        }

        const sm = new AnimationStateMachine(idle)

        this.animation.setup(scene)
        this.animation.playStateMachine(sm)
        this.handleDialogues()

        const bufferHeal = await this.assetLoader.getAudioAtPath('coin-6.wav');

        this.physicsSystem.onBeginOverlapWithActorType(this, PickUp)
            .subscribe(pickUp => {
            this.score.update(1);
            this.world.removeActor(pickUp);
            this.sound.setBuffer(bufferHeal).setVolume(0.5)
        })

        this.dialogueService.story?.setVariable('pickup', this.score.currentPoints as number);

    }

    private handleDialogues() {
        let pointerLockElement: Element | null = null
        const unsubscribe = this.dialogueService.activeDialogue.subscribe(activeDialogue => {
            if (activeDialogue != null) {
                if (this.thirdPersonCamera.isMouseLocked) {
                    pointerLockElement = window.document.pointerLockElement
                    this.thirdPersonCamera.showCursor()
                }
            } else if (activeDialogue == null && pointerLockElement != null) {
                this.thirdPersonCamera.hideCursor()
                pointerLockElement = null
            }
        })
        this.disposed.subscribe(() => unsubscribe())
    }

}

export default Character


export function fixCharacterMaterial(scene: Object3D) {
    scene.traverse(o => {
        if (o instanceof Mesh) {
            o.castShadow = true
            if (o.material instanceof Material) {
                o.material.transparent = false
                o.material.side = FrontSide
                o.material.depthWrite = true
                o.material.alphaTest = 0.1
            }
        }
    })
}

export function hideAccessories(scene: Object3D) {
    scene.traverse(o => {
        if (hats.includes(o.name) || mustaches.includes(o.name)) {
            o.visible = false
        }
    })
}

export function showHat(scene: Object3D, hatNumber: number) {
    scene.traverse(o => {
        if (o.name === hats[hatNumber]) {
            o.visible = true
        }
    })
}

export function showMustache(scene: Object3D, mustacheNumber: number) {
    scene.traverse(o => {
        if (o.name === mustaches[mustacheNumber]) {
            o.visible = true
        }
    })
}

export function setupCharacterModel(scene: Object3D, characterInfo?: StoryCharacter) {
    hideAccessories(scene)
    fixCharacterMaterial(scene)
    scene.scale.multiplyScalar(1.65)
    if (characterInfo != null) {
        if (characterInfo?.mustache != null) {
            if (characterInfo.mustache in mustaches) {
                showMustache(scene, characterInfo!.mustache!)
            } else {
                console.error("No mustache exist with number " + characterInfo.mustache)
            }
        }

        if (characterInfo?.hat != null) {
            if (characterInfo.hat in hats) {
                showHat(scene, characterInfo!.hat!)
            } else {
                console.error("No hat exist with number " + characterInfo.hat)
            }
        }
    }
}



const mustaches = [
    'Mustache_01',
    'Mustache_02',
    'Mustache_03',
]

const hats = [
    'Hat001',
    'Hat002',
    'Hat003',
]