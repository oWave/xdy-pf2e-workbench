import { ActorSourcePF2e } from "@actor/data/index.ts";
import { ItemSourcePF2e } from "@item/base/data/index.ts";
import { MigrationBase } from "../base.ts";
/** Convert rations to a consumable with seven uses */
export declare class Migration684RationsToConsumable extends MigrationBase {
    #private;
    static version: number;
    /** Swap "equipment" rations for new consumable */
    updateActor(source: ActorSourcePF2e): Promise<void>;
    /** Lower the quantity of rations contained in kits */
    updateItem(source: ItemSourcePF2e): Promise<void>;
}
