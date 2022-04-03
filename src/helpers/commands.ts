/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Command } from 'vscode';
import { Constants } from './constants';

export class CommandNames {
	static CommandPrefix: string = Constants.ExtensionName + '.';
	static About: string = CommandNames.CommandPrefix + 'About';
	static Archive: string = CommandNames.CommandPrefix + 'Archive';
	static ClearCache: string = CommandNames.CommandPrefix + 'ClearCache';
	static Depends: string = CommandNames.CommandPrefix + 'Depends';
	static Diagnose: string = CommandNames.CommandPrefix + 'Diagnose';
	static DumpAutoload: string = CommandNames.CommandPrefix + 'DumpAutoload';
	static Fund: string = CommandNames.CommandPrefix + 'Fund';
	static Init: string = CommandNames.CommandPrefix + 'Init';
	static Install: string = CommandNames.CommandPrefix + 'Install';
	static Licenses: string = CommandNames.CommandPrefix + 'Licenses';
	static Outdated: string = CommandNames.CommandPrefix + 'Outdated';
	static Prohibits: string = CommandNames.CommandPrefix + 'Prohibits';
	static Remove: string = CommandNames.CommandPrefix + 'Remove';
	static RemovePackage: string = CommandNames.CommandPrefix + 'RemovePackage';
	static Require: string = CommandNames.CommandPrefix + 'Require';
	static RunScript: string = CommandNames.CommandPrefix + 'RunScript';
	static SelfUpdate: string = CommandNames.CommandPrefix + 'SelfUpdate';
	static Show: string = CommandNames.CommandPrefix + 'Show';
	static Status: string = CommandNames.CommandPrefix + 'Status';
	static Suggests: string = CommandNames.CommandPrefix + 'Suggests';
	static Update: string = CommandNames.CommandPrefix + 'Update';
	static Validate: string = CommandNames.CommandPrefix + 'Validate';
	static Version: string = CommandNames.CommandPrefix + 'Version';
	static Why: string = CommandNames.CommandPrefix + 'Why';
	static WhyNot: string = CommandNames.CommandPrefix + 'WhyNot';
}

export interface ComposerCommand extends Command {
	id: string;
	label: string;
	description: string;
}
