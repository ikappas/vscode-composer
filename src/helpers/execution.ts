/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { IDisposable, toDisposable, dispose } from './lifecycle';
import * as cp from 'child_process';
import iconv = require('iconv-lite');
import { ComposerError, ComposerErrorCodes } from './errors';

export interface IExecutionResult {
	exitCode: number;
	stdout: string;
	stderr: string;
}

function cpErrorHandler(cb: (reason?: any) => void): (reason?: any) => void {
	return err => {
		if (/ENOENT/.test(err.message)) {
			err = new ComposerError({
				error: err,
				message: 'Failed to execute composer (ENOENT)',
				composerErrorCode: ComposerErrorCodes.NotAComposerRepository
			});
		}

		cb(err);
	};
}

export interface SpawnOptions extends cp.SpawnOptions {
	input?: string;
	encoding?: string;
	log?: boolean;
}

export async function exec(child: cp.ChildProcess, options: SpawnOptions = {}): Promise<IExecutionResult> {
	if (!child.stdout || !child.stderr) {
		throw new Error('Failed to get stdout or stderr from composer process.');
	}

	const disposables: IDisposable[] = [];

	const once = (ee: NodeJS.EventEmitter, name: string, fn: Function) => {
		ee.once(name, fn);
		disposables.push(toDisposable(() => ee.removeListener(name, fn)));
	};

	const on = (ee: NodeJS.EventEmitter, name: string, fn: Function) => {
		ee.on(name, fn);
		disposables.push(toDisposable(() => ee.removeListener(name, fn)));
	};

	let encoding = options.encoding || 'utf8';
	encoding = iconv.encodingExists(encoding) ? encoding : 'utf8';

	const [exitCode, stdout, stderr] = await Promise.all<any>([
		new Promise<number>((resolve, reject) => {
			once(child, 'error', cpErrorHandler(reject));
			once(child, 'exit', resolve);
		}),
		new Promise<string>(resolve => {
			const buffers: Buffer[] = [];
			on(child.stdout, 'data', (b: Buffer) => buffers.push(b));
			once(child.stdout, 'close', () => resolve(iconv.decode(Buffer.concat(buffers), encoding)));
		}),
		new Promise<string>(resolve => {
			const buffers: Buffer[] = [];
			on(child.stderr, 'data', (b: Buffer) => buffers.push(b));
			once(child.stderr, 'close', () => resolve(Buffer.concat(buffers).toString('utf8')));
		})
	]);

	dispose(disposables);

	return { exitCode, stdout, stderr };
}

export interface StreamOutput {
	(output: string): void;
}

export async function stream(child: cp.ChildProcess, progress: StreamOutput, encoding = 'utf8'): Promise<IExecutionResult> {
	const disposables: IDisposable[] = [];

	const once = (ee: NodeJS.EventEmitter, name: string, fn: Function) => {
		ee.once(name, fn);
		disposables.push(toDisposable(() => ee.removeListener(name, fn)));
	};

	const on = (ee: NodeJS.EventEmitter, name: string, fn: Function) => {
		ee.on(name, fn);
		disposables.push(toDisposable(() => ee.removeListener(name, fn)));
	};

	let exitCode = new Promise<number>((resolve, reject) => {
		once(child, 'error', reject);
		once(child, 'exit', resolve);
	});

	let stdout = new Promise<string>(resolve => {
		let buffers: Buffer[] = [];
		on(child.stdout, 'data', (b: Buffer) => {
			buffers.push(b);
			progress(iconv.decode(b, encoding));
		});
		once(child.stdout, 'close', () => resolve(iconv.decode(Buffer.concat(buffers), encoding)));
	});

	let stderr = new Promise<string>(resolve => {
		let buffers: Buffer[] = [];
		on(child.stderr, 'data', (b: Buffer) => {
			buffers.push(b);
			progress(iconv.decode(b, encoding));
		});
		once(child.stderr, 'close', () => resolve(iconv.decode(Buffer.concat(buffers), encoding)));
	});

	return Promise.all([exitCode, stdout, stderr]).then((values: any[]): IExecutionResult => {
		dispose(disposables);

		return {
			exitCode: values[0],
			stdout: values[1],
			stderr: values[2]
		};
	});
}
