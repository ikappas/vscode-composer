/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { WorkspaceFolder, Event, EventEmitter } from 'vscode';
import { ComposerSettings, ComposerSettingsChangeEvent } from './settings';

export class ComposerContext {
	private _folder: WorkspaceFolder;
	private _settings: ComposerSettings;
	private _onDidChangeSettings = new EventEmitter<ComposerSettingsChangeEvent>();

	/**
	 * Class Constructor.
	 * @param folder The target workspace folder.
	 */
	constructor(folder: WorkspaceFolder) {
		this.folder = folder;
	}

	/**
	 * Get the workspace folder associated with this context.
	 */
	public get folder(): WorkspaceFolder {
		return this._folder;
	}

	/**
	 * Set the workspace folder associated with this context.
	 */
	public set folder(folder: WorkspaceFolder) {
		this._folder = folder;
	}

	/**
	 * Get the composer settings associated with this context.
	 */
	public get settings(): ComposerSettings {
		if (!this._settings) {
			this.settings = new ComposerSettings(this.folder.uri);
		}
		return this._settings;
	}

	/**
	 * Set the composer settings associated with this context.
	 * @access private
	 */
	public set settings(settings: ComposerSettings) {
		this._settings = settings;
		this._onDidChangeSettings.fire({ settings: settings });
	}

	/**
	 * An event that is emitted when a composer settings object is set.
	 */
	public get onDidChangeSettings(): Event<ComposerSettingsChangeEvent> {
		return this._onDidChangeSettings.event;
	}

	/**
	 * Get the composer working path.
	 */
	public get workingPath(): string {
		let workingPath = this.folder.uri.fsPath;

		// Process settings.
		const settingsPath = this.settings.workingPath;
		if (settingsPath !== null && settingsPath !== undefined) {
			if (path.isAbsolute(settingsPath)) {
				workingPath = settingsPath;
			} else {
				workingPath = path.join(workingPath, settingsPath);
			}
		}

		return workingPath;
	}

	/**
	 * Get the composer.json path.
	 */
	public get composerJsonPath(): string {
		try {
			const composerJsonPath = fs.realpathSync(path.join(this.workingPath, 'composer.json'));
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
