// The scenes, in order. Each module: { id, setup(ctx), run(ctx), apply(ctx) }.

import coldOpen from "./00-cold-open.js";
import mia from "./01-mia.js";
import install from "./02-install.js";

export const scenes = [coldOpen, mia, install];
