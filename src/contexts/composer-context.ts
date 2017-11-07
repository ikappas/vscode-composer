/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import * as path from "path";
import * as fs from "fs";

export class ComposerContext {
	private _workingPath: string;

	/**
	 * Class Constructor.
	 * @param workingPath The composer working path.
	 */
	constructor(workingPath?: string) {
		this._workingPath = workingPath;
	}

	/**
	 * Get the composer working path.
	 */
	public get workingPath(): string {
		return this._workingPath;
	}

	/**
	 * Get the composer.json path.
	 */
	public get composerJsonPath(): string {
		try {
			let composerJsonPath = fs.realpathSync(path.join(this.workingPath, 'composer.json'));
			fs.accessSync(composerJsonPath);
			return composerJsonPath;
		} catch {
			return null;
		}
	}

	/**
	 * Determine whether we have a composer project.
	 */
	public isComposerProject(): boolean {
		try {
			return this.composerJsonPath !== null;
		} catch {
			return false;
		}
	}
}
