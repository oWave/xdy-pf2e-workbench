import { SKILL_ACTIONS_DATA } from "./skill-actions-data.js";
import { ItemPF2e } from "@item/base/document.js";

const ACTION_IDS = SKILL_ACTIONS_DATA.map((row) => row.compendiumId);

export class ActionsIndex extends Map<string, ItemPF2e> {
    private static _instance: ActionsIndex;

    static get instance() {
        if (!this._instance) {
            this._instance = new ActionsIndex();
        }
        return this._instance;
    }

    private constructor() {
        super();
    }

    async loadCompendium(packName: string) {
        const pack = game.packs.get(packName);
        if (!pack) {
            return;
        }

        let actions = <ItemPF2e[]>await pack.getDocuments();
        actions = actions.filter((a) => ACTION_IDS.includes(a.id));
        for (const action of actions.filter((a) => a.slug)) {
            this.set(<string>action.slug, action);
        }
    }
}
