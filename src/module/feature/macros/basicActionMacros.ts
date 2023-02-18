// Originally from ApoApostolov#4622, modified by me. Included with permission.
// noinspection CssUnresolvedCustomProperty,CssUnknownTarget

/* eslint-disable no-undef */
// TODO Fix the ts-ignore and any in this.

import { MODULENAME } from "../../xdy-pf2e-workbench";
import { ActorPF2e } from "@actor";
import { Variant } from "../skill-actions/variants";
import { CharacterSkill } from "@actor/character/types";
import { ModifierPF2e } from "../skill-actions/pf2e";

let selectedActor;

function getActor() {
    return canvas?.tokens.controlled.length
        ? canvas?.tokens.controlled.map((token) => token.actor)[0]
        : game.user.character;
}

function getBestBonuses(actorSkills, party, actionList) {
    for (const actorId of party) {
        const skills = actorSkills.get(actorId);
        for (const action of actionList) {
            const skill = skills[action.skill?.toLowerCase()];
            if (!skill) continue;
            const bonus = skill.check?.mod ?? skill.totalModifier;
            if (bonus > (action.best ?? -1)) {
                action.best = bonus;
                action.whoIsBest = actorId;
            }
        }
    }
}

function createMapOfSkillsPerActor(actors) {
    const map = new Map();
    for (const actor of actors) {
        const skills = fetchSkills(actor);
        if (skills) {
            map.set(actor.id, skills);
        }
    }
    return map;
}

function fetchSkills(actor) {
    const a = { perception: actor.attributes.perception, ...actor.skills };
    Array.from(a).map((skill: any) => {
        a.check.mod = skill.check?.mod;
        a.totalModifier = skill.to;
    });
    return a;
}

function signedNumber(n) {
    return n < 0 ? "" + n : "+" + n;
}

function createButton(action, idx, actor, party, actorSkills) {
    /**
     * Color palette to use, representing the rank of skills
     */
    const colorPalette = ["#424242", "#171f67", "#3c005e", "#664400", "#5e0000"];
    /**
     * Default Icon to be given in case there is no icon parameter in an Action
     */
    const defaultIcon = "systems/pf2e/icons/actions/craft/unknown-item.webp";
    const skillName = action.skill?.toLowerCase();
    const skill = skillName ? actorSkills[skillName] : null;
    const rank = skill?.rank ?? 0;
    const bonus = skill ? skill.check?.mod ?? skill.totalModifier : -1;
    const best = game.settings.get(MODULENAME, "basicActionMacroShowBestBonus")
        ? party.length && party.includes(actor.id)
            ? bonus >= (action.best ?? 0)
            : false
        : false;
    const name = `${action.name} ${skill ? "(" + signedNumber(bonus) + ")" : ""}`;
    const tooltip =
        name +
        " " +
        (best ? game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.YouAreTheBestInYourParty`) : "");
    let button: string;
    if (action.showMAP) {
        const second = game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.second`);
        const third = game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.third`);
        button =
            `<div class="map-wrapper">
              <button class="action-btn ${best ? "glow" : ""}" data-action="${idx}" data-map="0" style="background:${
                colorPalette[rank]
            }" ${`data-tooltip="${tooltip}"`}> <img src="${
                action.icon ?? defaultIcon
            }" height="24" width="24"   alt="${name}"/>${name}</button>` +
            `<button class="action-btn ${best ? "glow" : ""}" data-action="${idx}" data-map="-5" style="background:${
                colorPalette[rank]
            }" ${`data-tooltip="${tooltip} + ${second}"`}>${second}</button>` +
            `<button class="action-btn ${best ? "glow" : ""}" data-action="${idx}" data-map="-10" style="background:${
                colorPalette[rank]
            }" ${`data-tooltip="${tooltip} + ${third}"`}>${third}</button>
              </div>`;
    } else {
        button = `<button class="action-btn ${best ? "glow" : ""}" data-action="${idx}" style="background:${
            colorPalette[rank]
        }"
    ${`data-tooltip="${tooltip}"`}>
    <img src="${action.icon ?? defaultIcon}" height="24" alt="${name}"/>${name}</button>`;
    }
    return button;
}

type MacroAction = {
    skill: string;
    name: string;
    icon: string;
    action: string | Function | string[];
    showMAP?: boolean;
    extra?: string;
    actionType?: "basic" | "skill_untrained" | "skill_trained" | "other";
};

export function basicActionMacros() {
    /**
     * This macro opens a dialog containing a list of actions to be used by the selected Actor
     * If no actor is selected, it selects the user's standard character.
     * If there is no user character, it shows up a warning notification.
     */

    const actionList: MacroAction[] = [
        {
            actionType: "other",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.AidToggle`),
            skill: "",
            action: ["macroEffectAid", "xdy-pf2e-workbench.xdy-internal-utility-macros"],
            icon: "systems/pf2e/icons/spells/efficient-apport.webp",
        },
        {
            actionType: "other",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.AvoidNotice`),
            skill: "Stealth",
            action: game.pf2e.actions.avoidNotice,
            icon: "systems/pf2e/icons/features/classes/surprice-attack.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Balance`),
            skill: "Acrobatics",
            action: game.pf2e.actions.balance,
            icon: "icons/skills/movement/feet-winged-boots-brown.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Climb`),
            skill: "Athletics",
            action: game.pf2e.actions.climb,
            icon: "icons/sundries/misc/ladder.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Coerce`),
            skill: "Intimidation",
            action: game.pf2e.actions.coerce,
            icon: "icons/skills/melee/unarmed-punch-fist.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.CommandAnAnimal`),
            skill: "Nature",
            action: game.pf2e.actions.commandAnAnimal,
            icon: "icons/environment/creatures/horse-white.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.ConcealAnObject`),
            skill: "Stealth",
            action: game.pf2e.actions.concealAnObject,
            icon: "systems/pf2e/icons/equipment/adventuring-gear/wax-key-blank.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Craft`),
            skill: "Crafting",
            action: game.pf2e.actions.craft,
            icon: "icons/skills/trades/smithing-anvil-silver-red.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.CreateADiversionGesture`),
            skill: "Deception",
            action: "game.pf2e.actions.createADiversion({ event: event, variant: 'gesture' });",
            icon: "icons/skills/social/wave-halt-stop.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.CreateADiversionTrick`),
            skill: "Deception",
            action: "game.pf2e.actions.createADiversion({ event: event, variant: 'trick' });",
            icon: "systems/pf2e/icons/spells/charming-words.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.DecipherWritingArcana`),
            skill: "Arcana",
            action: game.pf2e.actions.decipherWriting,
            icon: "icons/skills/trades/academics-book-study-runes.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.DecipherWritingOccultism`),
            skill: "Occultism",
            action: game.pf2e.actions.decipherWriting,
            icon: "icons/skills/trades/academics-book-study-purple.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.DecipherWritingReligion`),
            skill: "Religion",
            action: game.pf2e.actions.decipherWriting,
            icon: "systems/pf2e/icons/equipment/other/spellbooks/thresholds-of-truth.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.DecipherWritingSociety`),
            skill: "Society",
            action: game.pf2e.actions.decipherWriting,
            icon: "icons/skills/trades/academics-study-reading-book.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Demoralize`),
            skill: "Intimidation",
            action: game.pf2e.actions.demoralize,
            icon: "icons/skills/social/intimidation-impressing.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Disarm`),
            skill: "Athletics",
            action: game.pf2e.actions.disarm,
            icon: "icons/skills/melee/sword-damaged-broken-glow-red.webp",
            showMAP: true,
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.DisableDevice`),
            skill: "Thievery",
            action: game.pf2e.actions.disableDevice,
            icon: "systems/pf2e/icons/equipment/adventuring-gear/thieves-tools.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Feint`),
            skill: "Deception",
            action: game.pf2e.actions.feint,
            icon: "icons/skills/melee/maneuver-sword-katana-yellow.webp",
        },
        {
            actionType: "other",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.FollowTheExpertToggle`),
            skill: "",
            action: ["macroEffectFollowTheExpert", "xdy-pf2e-workbench.xdy-internal-utility-macros"],
            icon: "systems/pf2e/icons/spells/favorable-review.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.ForceOpen`),
            skill: "Athletics",
            action: game.pf2e.actions.forceOpen,
            icon: "icons/equipment/feet/boots-armored-steel.webp",
            showMAP: true,
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.GatherInformation`),
            skill: "Diplomacy",
            action: game.pf2e.actions.gatherInformation,
            icon: "icons/skills/social/diplomacy-handshake.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Grapple`),
            skill: "Athletics",
            action: game.pf2e.actions.grapple,
            icon: "icons/skills/melee/unarmed-punch-fist.webp",
            showMAP: true,
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Hide`),
            skill: "Stealth",
            action: game.pf2e.actions.hide,
            icon: "icons/magic/nature/stealth-hide-eyes-green.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Impersonate`),
            skill: "Deception",
            action: game.pf2e.actions.impersonate,
            icon: "icons/equipment/head/mask-carved-scream-tan.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.JumpHigh`),
            skill: "Athletics",
            action: game.pf2e.actions.highJump,
            icon: "icons/skills/movement/arrows-up-trio-red.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.JumpLong`),
            skill: "Athletics",
            action: game.pf2e.actions.longJump,
            icon: "icons/skills/movement/figure-running-gray.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Lie`),
            skill: "Deception",
            action: game.pf2e.actions.lie,
            icon: "icons/magic/control/mouth-smile-deception-purple.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.MakeAnImpression`),
            skill: "Diplomacy",
            action: game.pf2e.actions.makeAnImpression,
            icon: "icons/environment/people/commoner.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.ManeuverInFlight`),
            skill: "Acrobatics",
            action: game.pf2e.actions.maneuverInFlight,
            icon: "icons/commodities/biological/wing-bird-white.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.PalmAnObject`),
            skill: "Thievery",
            action: game.pf2e.actions.palmAnObject,
            icon: "systems/pf2e/icons/spells/efficient-apport.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Perform`),
            skill: "Performance",
            action: game.pf2e.actions.perform,
            icon: "icons/skills/trades/music-singing-voice-blue.webp",
            extra: "singing",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.PickALock`),
            skill: "Thievery",
            action: game.pf2e.actions.pickALock,
            icon: "icons/skills/social/theft-pickpocket-bribery-brown.webp",
        },
        {
            actionType: "other",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.RaiseAShieldToggle`),
            skill: "",
            action: game.pf2e.actions.raiseAShield,
            icon: "systems/pf2e/icons/actions/raise-a-shield.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.RecallKnowledge`),
            skill: "",
            action: ["XDY DO_NOT_IMPORT Recall_Knowledge", "xdy-pf2e-workbench.asymonous-benefactor-macros-internal"],
            icon: "icons/skills/trades/academics-study-reading-book.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Repair`),
            skill: "Crafting",
            action: game.pf2e.actions.repair,
            icon: "icons/tools/smithing/anvil.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Request`),
            skill: "Diplomacy",
            action: game.pf2e.actions.request,
            icon: "icons/skills/social/thumbsup-approval-like.webp",
        },
        {
            actionType: "basic",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Seek`),
            skill: "Perception",
            action: game.pf2e.actions.seek,
            icon: "icons/tools/scribal/magnifying-glass.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.SenseDirection`),
            skill: "Survival",
            action: game.pf2e.actions.senseDirection,
            icon: "icons/tools/navigation/compass-brass-blue-red.webp",
        },
        {
            actionType: "basic",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.SenseMotive`),
            skill: "Perception",
            action: game.pf2e.actions.senseMotive,
            icon: "icons/environment/people/commoner.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Shove`),
            skill: "Athletics",
            action: game.pf2e.actions.shove,
            icon: "systems/pf2e/icons/spells/hydraulic-push.webp",
            showMAP: true,
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Sneak`),
            skill: "Stealth",
            action: game.pf2e.actions.sneak,
            icon: "systems/pf2e/icons/conditions/unnoticed.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Squeeze`),
            skill: "Acrobatics",
            action: game.pf2e.actions.squeeze,
            icon: "icons/commodities/tech/claw-mechanical.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Steal`),
            skill: "Thievery",
            action: game.pf2e.actions.steal,
            icon: "icons/containers/bags/coinpouch-gold-red.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.SubsistSociety`),
            skill: "Society",
            action: game.pf2e.actions.subsist,
            icon: "icons/environment/settlement/building-rubble.webp",
        },
        {
            actionType: "basic",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.SubsistSurvival`),
            skill: "Survival",
            action: game.pf2e.actions.subsist,
            icon: "icons/environment/wilderness/camp-improvised.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Swim`),
            skill: "Athletics",
            action: game.pf2e.actions.swim,
            icon: "icons/creatures/fish/fish-shark-swimming.webp",
        },
        {
            actionType: "other",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.TakeCoverToggle`),
            skill: "",
            action: ["macroEffectCover", "xdy-pf2e-workbench.xdy-internal-utility-macros"],
            icon: "systems/pf2e/icons/equipment/shields/tower-shield.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Track`),
            skill: "Survival",
            action: game.pf2e.actions.track,
            icon: "systems/pf2e/icons/conditions/observed.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.TreatDisease`),
            skill: "Medicine",
            action: game.pf2e.actions.treatDisease,
            icon: "icons/magic/nature/root-vine-caduceus-healing.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.TreatPoison`),
            skill: "Medicine",
            action: game.pf2e.actions.treatPoison,
            icon: "systems/pf2e/icons/effects/treat-poison.webp",
        },
        {
            actionType: "skill_trained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.TreatWounds`),
            skill: "Medicine",
            action: [
                "XDY DO_NOT_IMPORT Treat Wounds and Battle Medicine",
                "xdy-pf2e-workbench.asymonous-benefactor-macros-internal",
            ],
            icon: "icons/magic/nature/root-vine-caduceus-healing.webp",
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.Trip`),
            skill: "Athletics",
            action: game.pf2e.actions.trip,
            icon: "icons/skills/wounds/bone-broken-marrow-yellow.webp",
            showMAP: true,
        },
        {
            actionType: "skill_untrained",
            name: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.actions.TumbleThrough`),
            skill: "Acrobatics",
            action: game.pf2e.actions.tumbleThrough,
            icon: "icons/skills/movement/feet-winged-sandals-tan.webp",
        },
    ];

    // Sort actionList
    actionList.sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang));

    // @ts-ignore
    const actionDialog = window.actionDialog;
    if (actionDialog?.rendered) {
        return actionDialog.close();
    }

    selectedActor = getActor();

    if (!selectedActor) {
        return ui.notifications.warn(game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.noActorSelected`));
    }

    // @ts-ignore
    const actors: ActorPF2e[] = <ActorPF2e[]>game?.scenes?.current?.tokens
            .map((x) => x.actor)
            .filter((x) => x)
            .filter((x) => x?.isOfType("character") || x?.isOfType("familiar") || x?.isOfType("npc")) || [];

    const party = actors.filter((x) => x.hasPlayerOwner).filter((x) => x.alliance === "party");
    const partyIds = party.map((actor) => actor.id) || [];

    const actorSkills = createMapOfSkillsPerActor(actors);

    if (partyIds.includes(selectedActor.id)) {
        const partySkills = createMapOfSkillsPerActor(party);
        getBestBonuses(partySkills, partyIds, actionList);
    }

    const columns = 1 + ~~((actionList.length - 1) / 14);
    const width = 264 * columns;
    const height =
        30 +
        ~~(
            (32 * actionList.filter((x) => !x.showMAP).length +
                1 +
                (64 * actionList.filter((x) => x.showMAP).length + 1)) /
            columns
        );
    const content = `
<style>
  .pf2e-bg .window-content {
    background: url('../systems/pf2e/assets/sheet/background.webp');
  }
  .action-list {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-items: center;
    margin-bottom: 8px;
    max-height: ${height}px;
  }
  .action-btn {
    margin: 1px auto;
    width: 250px;
    height: fit-content;
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 50%);
    text-shadow: none;
    border: #000;
    color: #fff;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
  }
  .action-btn img {
    margin-right: 5px;
  }
  .action-btn:hover {
    text-shadow: 0 0 2px #fff;
  }
  .action-list button.glow {
    --color-glow1: 35;
    --color-glow2: 50;
    animation: glow2 alternate infinite 2s;
    z-index: 1;
}
  .map-wrapper {
    display: flex;
    gap: 5px;
    margin: 1px auto;
    width: 250px;
}
  .map-wrapper button {
    width: unset;
}
  .map-wrapper button:first-child {
    flex: 1 1 160px;
}
@keyframes glow2 {
  0% {
      color: hsl(var(--color-glow2), 90%, 50%);
      box-shadow: 0 0 2px 2px hsl(var(--color-glow2), 100%, 50%);
  }
  100% {
      color: hsl(var(--color-glow2), 90%, 50%);
      box-shadow: 0 0 2px 2px hsl(var(--color-glow2), 100%, 50%);
  }
}
</style>
<div class="action-list">
${actionList
    .map((action, idx) => createButton(action, idx, selectedActor, partyIds, actorSkills.get(selectedActor.id)))
    .join("")}
</div>
`;
    // @ts-ignore
    window.actionDialog = new Dialog(
        {
            title: game.i18n.format(`${MODULENAME}.macros.basicActionMacros.title`, {
                name: selectedActor.name,
            }),
            content,
            buttons: {
                close: {
                    icon: `<i class="fas fa-times"></i>`,
                    label: game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.cancel`),
                },
            },
            default: "close",
            render: (html) => {
                const action = (button, event) => {
                    const action = actionList[button.dataset.action];
                    const current = action.action;
                    if (typeof current === "string") {
                        if (!current.includes("(")) {
                            const macro = game.macros.get(current);
                            if (!macro) {
                                ui.notifications.error(
                                    game.i18n.localize(`${MODULENAME}.macros.basicActionMacros.gmMustImport`)
                                );
                                return;
                            }
                            macro?.execute();
                        } else {
                            // Ugh
                            eval(current);
                        }
                    } else if (Array.isArray(current)) {
                        const macroName = current[0];
                        const compendiumName = current[1];
                        const pack = game.packs.get(compendiumName);
                        if (pack) {
                            pack.getDocuments().then((documents) => {
                                const macro_data = documents.find((i) => i.name === macroName)?.toObject();
                                if (macro_data) {
                                    const temp_macro = new Macro(macro_data);
                                    temp_macro.execute();
                                } else {
                                    ui.notifications.error(
                                        game.i18n.format(`${MODULENAME}.macros.basicActionMacros.macroNotFound`, {
                                            macroName,
                                        })
                                    );
                                }
                            });
                        } else {
                            ui.notifications.error(
                                game.i18n.format(`${MODULENAME}.macros.basicActionMacros.compendiumNotFound`, {
                                    compendiumName,
                                })
                            );
                        }
                    } else {
                        const skills = getSkills(action.skill);
                        const variant =
                            button.dataset.map && button.dataset.map !== "0"
                                ? getMapVariant(skills[0], {}, Number.parseInt(button.dataset.map))
                                : null;
                        if (variant) {
                            (<Function>action.action)({
                                event,
                                actors: [selectedActor],
                                modifiers: variant?.modifiers,
                                ...variant?.extra,
                            });
                        } else {
                            // @ts-ignore
                            action.action({
                                event: event,
                                actors: [selectedActor],
                                skill: action.skill.toLocaleLowerCase(),
                                variant: action.extra,
                            });
                        }
                    }
                };
                if ("querySelectorAll" in html) {
                    html.querySelectorAll(".action-list button").forEach((button) =>
                        button.addEventListener("click", (event) => action(button, event))
                    );
                }
            },
        },
        // @ts-ignore
        { jQuery: false, width, classes: ["pf2e-bg"] }
    ).render(true);
}

function getSkills(proficiencyKey: string): CharacterSkill[] {
    // @ts-ignore
    const skills = selectedActor.skills;
    if (proficiencyKey === "lore") {
        // @ts-ignore
        return Object.values(skills).filter((skill) => skill.lore);
    } else {
        return [skills[proficiencyKey]].filter((s): s is CharacterSkill => !!s);
    }
}

function getMapVariant(skill: CharacterSkill, extra: Record<string, unknown> | undefined, map: number): Variant {
    const modifier = new ModifierPF2e({
        label: game.i18n.localize("PF2E.MultipleAttackPenalty"),
        modifier: map,
        type: "untyped",
    });
    const label = game.i18n.format("PF2E.MAPAbbreviationLabel", { penalty: map });
    return new Variant(label, skill, extra, [modifier]);
}

// basicActionsMacros();
