import { generateNameFromTraits } from "./traits-name-generator";
import { MODULENAME } from "./xdy-pf2e-workbench";
import { mystifyKey } from "./settings";
import { GAME } from "./xdy-pf2e-constants";

export async function mystifyToken(token: Token | null, mystified: boolean): Promise<string> {
    if (token === null) return "";
    let name = token?.name || "";
    if (token) {
        if (mystified) {
            name = token?.actor?.name || "";
        } else {
            switch ((game as Game).settings.get(MODULENAME, "npcMystifierMethod")) {
                default:
                    name = generateNameFromTraits(token);
            }
        }
    }
    if (token.document) {
        await token.document.update({ name: name });
    } else {
        token.data.name = name;
        token.data.update(token.data);
    }

    return name;
}

export function preTokenCreateMystification(token: Token) {
    if (
        GAME.user?.isGM &&
        GAME.keyboard?.isDown(mystifyKey) &&
        (!GAME.keyboard?.isDown("V") || GAME.keyboard.isDown("Insert"))
    ) {
        mystifyToken(token, isMystified(token));
    }
}

function isMystified(token: Token | null) {
    return token?.data.name !== token?.actor?.name || false;
}

export function renderNameHud(data: any, html: JQuery<HTMLElement>) {
    let token: Token | null;
    if ((game as Game).user?.isGM && canvas instanceof Canvas && canvas && canvas.tokens) {
        token = canvas.tokens.get(data._id) ?? null;

        const title = isMystified(token) ? "Unmystify" : "Mystify";
        const toggle = $(
            `<div class="control-icon ${
                isMystified(token) ? "active" : ""
            }" > <i class="fas fa-eye-slash"  title=${title}></i></div>`
        );
        toggle.on("click", async (e) => {
            const hudElement = $(e.currentTarget);
            const active = hudElement.hasClass("active");
            if (isMystified(token) === active) {
                await mystifyToken(token, active);
            }
            hudElement.toggleClass("active");
        });
        html.find("div.col.right").append(toggle);
    }
}
