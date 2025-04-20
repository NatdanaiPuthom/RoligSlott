import { Service } from "@hology/core/gameplay";
import { signal } from "@preact/signals-react"
import arcweaveProject from '../arcweave.json'
//import arcweaveProject from 'virtual:arcweave'
import { StoryOption, ArcweaveStory, ArcweaveProject } from "@hology/arcweave";
import { ReplaySubject } from "rxjs";

export type DialogueStoryEnd = {
  body: string
  restartButtonText: string
}

export type DialogueElement = {
  speakerName?: string
  content: string
  options: StoryOption[]
  end: boolean,
  storyEnd: DialogueStoryEnd|null
}

export type AudioRef = {
  url?: string
}

export type StorySettings = {
  playerCharacter?: StoryCharacter
  musicTracks: AudioRef[]
}

@Service()
class DialogueService {
  readonly activeDialogue = signal<DialogueElement|null>(null)
  story?: ArcweaveStory<ArcweaveProject>
  readonly ready = new ReplaySubject<boolean>(1)
  private projectHash?: string
  private projectData?: ArcweaveProject

  async init() {
    this.projectHash = getProjectHash()

    // Instead of using the api, it can just use the import json export as part of the project.
    // this.projectData = arcweaveProject
    this.projectData = await getProjectData(this.projectHash)
    this.story = new ArcweaveStory(this.projectData!)
    
    this.ready.next(true)
  }

  startDialogue(objId: string) {
    if (this.story == null) {return}
    const characterId = this.story?.findComponentId({attribute: [
      {name: 'object_id', value: objId}, 
      {name: 'object_type', value: 'character'}
    ]})
    if (characterId == null) {
      console.error(`Could not find character with object_id ${objId}`)
      return
    }
    const startElementId = this.story?.findElementId({attribute: [{name: 'dialogue', value: 'start'}], componentId: characterId})
    if (startElementId == null) {
      console.error(`Could not find dialogue start for character with object_id ${objId}`)
      return
    }
    this.story?.setCurrentElement(startElementId)
    this.updateActiveDialogue()
  }

  endDialogue() {
    this.activeDialogue.value = null
  }

  selectOption(path: StoryOption) {
    if (this.story == null) {return}
    this.story?.selectOption(path)
    this.updateActiveDialogue()
  }

  private updateActiveDialogue() {
    if (this.story == null) {return}
    const element = this.story?.getCurrentElement()
    if (element == null) {
      this.activeDialogue.value = null
      return
    }
    const storyEndComponent = element.components.find(c => c.attributes['object_type'] === 'story_end')
    const storyEnd = storyEndComponent != null
      ? {
        body: typeof storyEndComponent.attributes.body === 'string' 
          ? storyEndComponent.attributes.body
          : 'Game over',
        restartButtonText: typeof storyEndComponent.attributes.restart_button_text === 'string' 
          ? storyEndComponent.attributes.restart_button_text
          : 'Restart',
      } satisfies DialogueStoryEnd
      : null
    this.activeDialogue.value = {
      speakerName: element.components.find(c => c.attributes['object_id'] != null)?.name,
      content: element.content,
      options: element.options,
      end: element.attributes['dialogue'] === 'end' || element.options.length === 0,
      storyEnd: storyEnd
    }
  }

  getCharacter(objectId: string): StoryCharacter|undefined {
    if (this.story == null) {return}
    const componentId = this.story.findComponentId({attribute: [{name: 'object_id', value: objectId}, {name: 'object_type', value: 'character'}]})
    if (componentId == null) {
      throw "No character component exists with object id " + objectId
    }
    return this.getCharacterById(componentId)
  }

  getCharacterById(componentId: string): StoryCharacter|undefined {
    if (this.story == null) {return}
    const attributes = this.story.getComponentAttributes(componentId)

    // mustache is a component list
    // so find the first component and use the mustache selection 
    let mustache: number|undefined
    if (attributes.mustache && Array.isArray(attributes.mustache) && attributes.mustache.length > 0) {
      const itemComponent = this.story.getComponentAttributes(attributes.mustache[0])
      if (itemComponent['object_id'] != null && typeof itemComponent['object_id'] === 'string') {
        mustache = Number.parseInt(itemComponent['object_id']) - 1
      } 
    }
    let hat: number|undefined
    if (attributes.hat && Array.isArray(attributes.hat) && attributes.hat.length > 0) {
      const itemComponent = this.story.getComponentAttributes(attributes.hat[0])
      if (itemComponent['object_id'] != null && typeof itemComponent['object_id'] === 'string') {
        hat = Number.parseInt(itemComponent['object_id']) - 1
      } 
    }
    // get spawn point reference. then find a way to find the spawn point 
    // actor in the scene to spawn the player's character
    return {
      id: componentId,
      mustache,
      hat,
      asset: attributes['asset'] as string ?? null

      /*mustache: attributes.mustache != null && typeof attributes.mustache === 'string' 
        ? Number.parseInt(attributes.mustache) : undefined*/
    }
  }

  getSpawnPoint(objectId: string) {
    if (this.story == null) {return}
    const componentId = this.story.findComponentId({attribute: [
      {name: 'object_id', value: objectId}, 
      {name: 'object_type', value: 'spawn_point'}
    ]})
    if (componentId == null) {
      throw "No spawn point component exists with object id " + objectId
    }
    const characterComponentId = this.story.findComponentId({attribute: [
      {name: 'object_type', value: 'character'}, 
      {name: 'spawn_point', value: componentId}
    ]})
    if (characterComponentId == null) {
      return {
        id: componentId 
      }
    }
    const characterAttributes = this.story.getComponentAttributes(characterComponentId)
    return {
      id: componentId, 
      character: {
        id: characterComponentId,
        objectId: characterAttributes['object_id'] as string ?? null,
        asset: characterAttributes['asset'] as string ?? null
      }
    }
  }

  getSettings() {
    if (this.story == null) {return}

    const componentId = this.story.findComponentId({attribute: [
      {name: 'object_type', value: 'settings'}
    ]})  
    if (componentId == null) {
      throw "No settings component exists"
    }

    const settingsAttributes = this.story.getComponentAttributes(componentId)
    
    const settings: StorySettings = {
      musicTracks: []
    }
    if (settingsAttributes['player_character'] != null && Array.isArray(settingsAttributes['player_character'])
      && settingsAttributes['player_character'].length > 0) {
      settings.playerCharacter = this.getCharacterById(settingsAttributes['player_character'][0])
    } else {
      console.warn("No player character configured in settings component")
    }

    if (settingsAttributes['music_tracks'] != null && Array.isArray(settingsAttributes['music_tracks'])) {
      settings.musicTracks = settingsAttributes['music_tracks']
        .map(assetId => this.projectData?.assets[assetId])
        .filter(x => x != null)
        .filter(asset => 'type' in asset && asset.type === 'audio')
        .map(asset => {
          return {
            url: this.projectHash != null  && 'file' in asset && typeof asset.file === 'string'
              ? getAssetUrl(this.projectHash, 'audios', asset.file)
              : undefined
            } satisfies AudioRef
      })
      
    }     

    return settings
    
  }
}

export { DialogueService }

export type StoryCharacter = {
  id: string
  mustache?: number
  hat?: number
  asset?: string
}


const url = 'https://arcweave.com/api/';
const apiKey: string|undefined = import.meta.env?.VITE_AW_API_KEY
const defaultProjectHash = 'DaEWKXeE1P'

export function getProjectHash() {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return params.get('project') ?? defaultProjectHash
}

function getAssetUrl(projectHash: string, assetType: string, file: string) {
  return `https://storage.googleapis.com/media.arcweave.com/ProdServer/projects/${projectHash}/${assetType}/${file}`
}

export async function getProjectData(projectHash: string = getProjectHash()): Promise<ArcweaveProject> {
  const options = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Accept': 'application/json',
        'AW-No-Filter-Asset-Names': 'true'
    }
  };

  if (apiKey != null) {
    const response = await fetch(url + projectHash + '/json', options)
      .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch Arcweave Project. HTTP error. Status: ${response.status}`);
        }
        return response.json();
    })
    return response
  } else {
    return arcweaveProject as ArcweaveProject
  }
}
