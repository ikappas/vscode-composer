/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

export const ComposerErrorCodes = {
	BadConfigFile: 'BadConfigFile',
	NotAComposerRepository: 'NotAComposerRepository',
};

export function getComposerErrorCode(stderr: string): string | undefined {
	if (/Not a composer repository/.test(stderr)) {
		return ComposerErrorCodes.NotAComposerRepository;
	} else if (/bad config file/.test(stderr)) {
		return ComposerErrorCodes.BadConfigFile;
	}

	return void 0;
}

export interface IComposerErrorData {
	error?: Error;
	message?: string;
	stdout?: string;
	stderr?: string;
	exitCode?: number;
	composerErrorCode?: string;
	composerCommand?: string;
}

export class ComposerError {

	error?: Error;
	message: string;
	stdout?: string;
	stderr?: string;
	exitCode?: number;
	composerErrorCode?: string;
	composerCommand?: string;

	constructor(data: IComposerErrorData) {
		if (data.error) {
			this.error = data.error;
			this.message = data.error.message;
		} else {
			this.error = void 0;
		}

		this.message = this.message || data.message || 'composer error';
		this.stdout = data.stdout;
		this.stderr = data.stderr;
		this.exitCode = data.exitCode;
		this.composerErrorCode = data.composerErrorCode;
		this.composerCommand = data.composerCommand;
	}

	toString(): string {
		let result = this.message + ' ' + JSON.stringify({
			exitCode: this.exitCode,
			composerErrorCode: this.composerErrorCode,
			composerCommand: this.composerCommand,
			stdout: this.stdout,
			stderr: this.stderr
		}, null, 2);

		if (this.error) {
			result += (<any>this.error).stack;
		}

		return result;
	}
}
