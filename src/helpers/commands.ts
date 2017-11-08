/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import { Command } from 'vscode';
import { ComposerContext } from '../contexts/composer-context';

export interface ComposerCommandHandler {
	(context: ComposerContext, ...args: any[]): any;
}

export interface ComposerCommand extends Command {
	id: string;
	label: string;
	description: string;
}
