/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import { workspace } from "vscode";
import { SettingNames } from "./constants";

abstract class BaseSettings {
    protected readSetting<T>(name: string, defaultValue:T): T {
        let configuration = workspace.getConfiguration();
        let value = configuration.get<T>(name, undefined);

        // If user specified a value, use it
        if (value !== undefined && value !== null) {
            return value;
        }
        return defaultValue;
    }
}

export class Settings extends BaseSettings {
    private _enabled: boolean;
    private _executablePath: string;
	private _projectRoot: string;

    constructor() {
        super();

		this._enabled = this.readSetting<boolean>(SettingNames.Enabled, true);
        this._executablePath = this.readSetting<string>(SettingNames.ExecutablePath, undefined);
		this._projectRoot = this.readSetting<string>(SettingNames.ProjectRoot, undefined);
    }

	public get enabled(): boolean {
		return this._enabled;
	}

    public get executablePath(): string {
        return this._executablePath;
    }

	public get projectRoot(): string {
		return this._projectRoot;
	}
}