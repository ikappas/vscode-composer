/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import * as path from "path";
import * as fs from "fs";

export class ComposerContext {
	private _composerJsonPath: string;
	private _isComposerProject: boolean = false;

	constructor(rootPath ?: string) {
        this._isComposerProject = false;
        if (typeof(rootPath) !== 'undefined') {
			let composerJsonPath = path.join(rootPath, 'composer.json');
			fs.access( composerJsonPath, () => {
				this._composerJsonPath = composerJsonPath;
				this._isComposerProject = true;
			});
        }
    }

	public get composerJsonPath(): string {
		return this._composerJsonPath;
	}

	public get isComposerProject(): boolean {
		return this._isComposerProject;
	}
}
