import { Actor, BaseActor, Parameter, attach } from "@hology/core/gameplay";
import { AssetLoader, inject } from '@hology/core/gameplay';
import { PhysicsSystem } from '@hology/core/gameplay';
import { TriggerVolumeComponent } from "@hology/core/gameplay/actors";
import { Object3D } from "three";

@Actor()
class PickUp extends BaseActor {
    @Parameter()
    assets?: Object3D

    private physics = inject(PhysicsSystem)

    private triggerVolume = attach(TriggerVolumeComponent, {
    })

    private assetLoader = inject(AssetLoader)

    async onInit()
    {
        if (this.assets != null) {
            this.assets.scale.set(0.01, 0.01, 0.01);
            this.object.add(this.assets)
        }
    }
}

export default PickUp