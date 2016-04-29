/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
"use strict";

import { ExtensionContext } from "vscode";
import { ComposerExtension } from "./composer-extension";

export function activate(context: ExtensionContext) {
    let composer = new ComposerExtension();
    context.subscriptions.push(composer);
}
