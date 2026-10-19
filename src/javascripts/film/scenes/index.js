// The scenes, in order. Each module: { id, setup(ctx), run(ctx), apply(ctx) }.

import coldOpen from "./00-cold-open.js";
import mia from "./01-mia.js";
import install from "./02-install.js";
import questions from "./03-questions.js";
import observation from "./04-observation.js";
import responsibility from "./05-responsibility.js";
import handover from "./06-handover.js";
import autopilot from "./07-autopilot.js";
import miaAgain from "./08-mia-again.js";
import cantQuit from "./09-cant-quit.js";

export const scenes = [coldOpen, mia, install, questions, observation, responsibility, handover, autopilot, miaAgain, cantQuit];
