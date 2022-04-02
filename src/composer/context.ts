/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { WorkspaceFolder, Event, EventEmitter } from 'vscode';
import { ComposerClient, ComposerClientChangeEvent } from './client';
import { ComposerSettings, ComposerSettingsChangeEvent } from './settings';
import { ComposerError } from '../helpers/errors';
import { Strings } from '../helpers/strings';

export class ComposerContext {

	private _folder: WorkspaceFolder;
	private _settings: ComposerSettings;
	private _client: ComposerClient;

	private _onDidChangeSettings = new EventEmitter<ComposerSettingsChangeEvent>();
	private _onDidChangeClient = new EventEmitter<ComposerClientChangeEvent>();

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
	 * Get the composer client associated with this context.
	 */
	public get client(): ComposerClient {
		if (!this._client) {
			if (!this.settings.executablePath) {
				throw new ComposerError({
					message: Strings.ComposerExecutablePathRequired
				});
			}
			this.client = new ComposerClient(
				this.settings.executablePath,
				this.workingPath,
				process.env
			);
		}
		return this._client;
	}

	/**
	 * Set the composer client associated with this context.
	 * @access private
	 */
	public set client(client: ComposerClient) {
		this._client = client;
		this._onDidChangeClient.fire({ client: this._client });
	}

	/**
	 * An event that is emitted when a composer client object is set.
	 */
	public get onDidChangeClient(): Event<ComposerClientChangeEvent> {
		return this._onDidChangeClient.event;
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
