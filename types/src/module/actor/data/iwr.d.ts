import { ImmunityType, IWRType, ResistanceType, WeaknessType } from "@actor/types.ts";
import { PredicatePF2e, PredicateStatement } from "@system/predication.ts";
declare abstract class IWRData<TType extends IWRType> {
    readonly type: TType;
    readonly exceptions: TType[];
    source: string | null;
    protected abstract readonly typeLabels: Record<TType, string>;
    constructor(data: IWRConstructorData<TType>);
    abstract get label(): string;
    /** A label showing the type, exceptions, and doubleVs but no value (in case of weaknesses and resistances) */
    get applicationLabel(): string;
    get typeLabel(): string;
    protected describe(iwrType: TType): PredicateStatement[];
    get predicate(): PredicatePF2e;
    toObject(): Readonly<IWRDisplayData<TType>>;
    /** Construct an object argument for Localization#format (see also PF2E.Actor.IWR.CompositeLabel in en.json) */
    protected createFormatData({ list, prefix }: {
        list: TType[];
        prefix: string;
    }): Record<string, string>;
    test(statements: string[] | Set<string>): boolean;
}
type IWRConstructorData<TType extends IWRType> = {
    type: TType;
    exceptions?: TType[];
    source?: string | null;
};
type IWRDisplayData<TType extends IWRType> = Pick<IWRData<TType>, "type" | "exceptions" | "source" | "label">;
declare class ImmunityData extends IWRData<ImmunityType> implements ImmunitySource {
    protected readonly typeLabels: {
        acid: string;
        adamantine: string;
        air: string;
        "area-damage": string;
        auditory: string;
        bleed: string;
        blinded: string;
        bludgeoning: string;
        chaotic: string;
        clumsy: string;
        cold: string;
        "cold-iron": string;
        confused: string;
        conjuration: string;
        controlled: string;
        "critical-hits": string;
        curse: string;
        darkwood: string;
        dazzled: string;
        deafened: string;
        "death-effects": string;
        disease: string;
        doomed: string;
        drained: string;
        earth: string;
        electricity: string;
        emotion: string;
        enchantment: string;
        energy: string;
        enfeebled: string;
        evil: string;
        evocation: string;
        fascinated: string;
        fatigued: string;
        "fear-effects": string;
        fire: string;
        fleeing: string;
        force: string;
        frightened: string;
        good: string;
        grabbed: string;
        healing: string;
        illusion: string;
        immobilized: string;
        inhaled: string;
        lawful: string;
        light: string;
        magic: string;
        mental: string;
        metal: string;
        "misfortune-effects": string;
        mithral: string;
        necromancy: string;
        negative: string;
        "non-magical": string;
        "nonlethal-attacks": string;
        "object-immunities": string;
        "off-guard": string;
        olfactory: string;
        orichalcum: string;
        paralyzed: string;
        petrified: string;
        physical: string;
        piercing: string;
        poison: string;
        polymorph: string;
        positive: string;
        possession: string;
        precision: string;
        prone: string;
        radiation: string;
        restrained: string;
        "salt-water": string;
        scrying: string;
        sickened: string;
        silver: string;
        slashing: string;
        sleep: string;
        slowed: string;
        sonic: string;
        "spell-deflection": string;
        stunned: string;
        stupefied: string;
        "swarm-attacks": string;
        "swarm-mind": string;
        transmutation: string;
        trip: string;
        "unarmed-attacks": string;
        unconscious: string;
        visual: string;
        water: string;
        wood: string;
    };
    /** No value on immunities, so the full label is the same as the application label */
    get label(): string;
}
interface IWRSource<TType extends IWRType = IWRType> {
    type: TType;
    exceptions?: TType[];
}
type ImmunitySource = IWRSource<ImmunityType>;
declare class WeaknessData extends IWRData<WeaknessType> implements WeaknessSource {
    protected readonly typeLabels: {
        acid: string;
        adamantine: string;
        air: string;
        "area-damage": string;
        "arrow-vulnerability": string;
        "axe-vulnerability": string;
        bleed: string;
        bludgeoning: string;
        chaotic: string;
        cold: string;
        "cold-iron": string;
        "critical-hits": string;
        darkwood: string;
        earth: string;
        electricity: string;
        emotion: string;
        energy: string;
        evil: string;
        fire: string;
        force: string;
        "ghost-touch": string;
        glass: string;
        good: string;
        lawful: string;
        light: string;
        magical: string;
        mental: string;
        metal: string;
        mithral: string;
        negative: string;
        "non-magical": string;
        "nonlethal-attacks": string;
        orichalcum: string;
        physical: string;
        piercing: string;
        poison: string;
        positive: string;
        precision: string;
        radiation: string;
        salt: string;
        "salt-water": string;
        silver: string;
        slashing: string;
        sonic: string;
        spells: string;
        "splash-damage": string;
        "unarmed-attacks": string;
        "vampire-weaknesses": string;
        vorpal: string;
        "vorpal-fear": string;
        "vulnerable-to-sunlight": string;
        warpglass: string;
        water: string;
        weapons: string;
        "weapons-shedding-bright-light": string;
        wood: string;
    };
    value: number;
    constructor(data: IWRConstructorData<WeaknessType> & {
        value: number;
    });
    get label(): string;
    toObject(): Readonly<WeaknessDisplayData>;
}
type WeaknessDisplayData = IWRDisplayData<WeaknessType> & Pick<WeaknessData, "value">;
interface WeaknessSource extends IWRSource<WeaknessType> {
    value: number;
}
declare class ResistanceData extends IWRData<ResistanceType> implements ResistanceSource {
    protected readonly typeLabels: {
        acid: string;
        adamantine: string;
        air: string;
        "all-damage": string;
        "area-damage": string;
        bleed: string;
        bludgeoning: string;
        chaotic: string;
        cold: string;
        "cold-iron": string;
        "critical-hits": string;
        "damage-from-spells": string;
        darkwood: string;
        earth: string;
        electricity: string;
        energy: string;
        evil: string;
        fire: string;
        force: string;
        "ghost-touch": string;
        good: string;
        lawful: string;
        light: string;
        magical: string;
        mental: string;
        metal: string;
        mithral: string;
        negative: string;
        "non-magical": string;
        nonlethal: string;
        "nonlethal-attacks": string;
        orichalcum: string;
        physical: string;
        piercing: string;
        plant: string;
        poison: string;
        positive: string;
        precision: string;
        "protean-anatomy": string;
        radiation: string;
        salt: string;
        "salt-water": string;
        silver: string;
        slashing: string;
        sonic: string;
        spells: string;
        "unarmed-attacks": string;
        vorpal: string;
        "vorpal-adamantine": string;
        warpglass: string;
        water: string;
        weapons: string;
        "weapons-shedding-bright-light": string;
        wood: string;
    };
    value: number;
    readonly doubleVs: ResistanceType[];
    constructor(data: IWRConstructorData<ResistanceType> & {
        value: number;
        doubleVs?: ResistanceType[];
    });
    get label(): string;
    get applicationLabel(): string;
    toObject(): ResistanceDisplayData;
    /** Get the doubled value of this resistance if present and applicable to a given instance of damage */
    getDoubledValue(damageDescription: Set<string>): number;
}
type ResistanceDisplayData = IWRDisplayData<ResistanceType> & Pick<ResistanceData, "value" | "doubleVs">;
interface ResistanceSource extends IWRSource<ResistanceType> {
    value: number;
    doubleVs?: ResistanceType[];
}
/** Weaknesses to things that "[don't] normally deal damage, such as water": applied separately as untyped damage */
declare const NON_DAMAGE_WEAKNESSES: Set<IWRType>;
export { ImmunityData, ImmunitySource, IWRSource, NON_DAMAGE_WEAKNESSES, ResistanceData, ResistanceSource, WeaknessData, WeaknessSource, };
