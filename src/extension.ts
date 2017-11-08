/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { ExtensionContext } from "vscode";
import { ComposerExtension } from "./composer-extension";

export function activate(context: ExtensionContext) {
    let composer = new ComposerExtension();
    context.subscriptions.push(composer);
}
