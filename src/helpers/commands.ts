/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import { Command } from 'vscode';

export interface ComposerCommand extends Command {
	id: string;
	label: string;
	description: string;
}
