import { SphereCollisionShape } from "@hology/core";
import { Actor, BaseActor, Parameter } from "@hology/core/gameplay";
import { inject } from '@hology/core/gameplay';
import { PhysicsSystem } from '@hology/core/gameplay';
import { Object3D } from "three";

@Actor()
class PickUp extends BaseActor
{
    @Parameter() assets?: Object3D

    private physics = inject(PhysicsSystem)

    public async onInit()
    {
        if (this.assets != null)
        {
            this.assets.scale.set(0.01, 0.01, 0.01);
            this.object.add(this.assets)
            this.physics.addActor(this, [new SphereCollisionShape(1)], { isTrigger: true })
        }
    }

    public OnRemove()
    {
        this.physics.removeActor(this);
    }
}

export default PickUp