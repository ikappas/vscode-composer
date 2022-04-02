/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { ConfigurationScope, workspace, WorkspaceConfiguration } from 'vscode';
import { Constants } from '../helpers/constants';

export class SettingNames {
	static SettingsPrefix: string = Constants.ExtensionName + '.';
	static Enabled: string = SettingNames.SettingsPrefix + 'enabled';
	static ExecutablePath: string = SettingNames.SettingsPrefix + 'executablePath';
	static WorkingPath: string = SettingNames.SettingsPrefix + 'workingPath';
}

export class ComposerSettings {
	private _config: WorkspaceConfiguration

	constructor(scope?: ConfigurationScope) {
		this._config = workspace.getConfiguration('', scope);
	}

	public get enabled(): boolean {
		return this._config.get<boolean>(SettingNames.Enabled, true);
	}

	public get executablePath(): string {
		return this._config.get<string>(SettingNames.ExecutablePath, undefined);
	}

	public get workingPath(): string {
		return this._config.get<string>(SettingNames.WorkingPath, undefined);
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
