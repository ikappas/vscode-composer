/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { workspace, Uri, WorkspaceConfiguration } from "vscode";
import { Constants } from "./constants";

export class SettingNames {
	static SettingsPrefix: string = Constants.ExtensionName + '.';
	static Enabled: string = SettingNames.SettingsPrefix + 'enabled';
	static ExecutablePath: string = SettingNames.SettingsPrefix + 'executablePath';
	static WorkingPath: string = SettingNames.SettingsPrefix + 'workingPath';
}

abstract class BaseSettings {

	/**
	 * The resource for which the settings apply.
	 */
	private _resource : Uri;

	/**
	 * Class constructor.
	 * @param resource The resource for which the settings apply.
	 */
	constructor(resource: Uri = undefined) {
		this._resource = resource;
	}

	/**
	 * Get the resource for which the settings apply.
	 */
	public get resource(): Uri {
		return this._resource;
	}

	/**
	 * Read the setting.
	 *
	 * @param name The name of the setting.
	 * @param defaultValue The default value for the setting.
	 */
	protected readSetting<T>(name: string, defaultValue:T): T {
		let config: WorkspaceConfiguration;
		if (this.resource === null || this.resource === undefined ){
			// Reading Window scoped configuration
			config = workspace.getConfiguration('', null);
		} else {
			// Reading Resource scoped configuration
			config = workspace.getConfiguration('', this.resource);
		}
		let value = config.get<T>(name, undefined);

		// If user specified a value, use it
		if (value !== undefined && value !== null) {
			return value;
		}
		return defaultValue;
	}
}

export class ComposerSettings extends BaseSettings {
	private _enabled: boolean;
	private _executablePath: string;
	private _workingPath: string;

	constructor(resource: Uri = null) {
		super(resource);

		this._enabled = this.readSetting<boolean>(SettingNames.Enabled, true);
		this._executablePath = this.readSetting<string>(SettingNames.ExecutablePath, undefined);
		this._workingPath = this.readSetting<string>(SettingNames.WorkingPath, undefined);
	}

	public get enabled(): boolean {
		return this._enabled;
	}

	public get executablePath(): string {
		return this._executablePath;
	}

	public get workingPath(): string {
		return this._workingPath;
	}
}

/**
 * An event describing a transactional composer workspace settings change.
 */
export interface ComposerSettingsChangeEvent {

	/**
	 * The affected settings.
	 */
	settings: ComposerSettings;
}
