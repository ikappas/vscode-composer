/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
"use strict";

import { IDisposable, toDisposable, dispose } from './lifecycle';
import { ChildProcess } from 'child_process';
import { decode } from '../node/encoding';

export interface IExecutionResult {
	exitCode: number;
	stdout: string;
	stderr: string;
}

export interface StreamOutput {
    (output: string): void;
}

export function exec(child: ChildProcess, encoding = 'utf8'): Promise<IExecutionResult> {
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

	let stdout = new Promise<string>((resolve, reject) => {
		let buffers: Buffer[] = [];
		on(child.stdout, 'data', b => buffers.push(b));
		once(child.stdout, 'close', () => resolve(decode(Buffer.concat(buffers), encoding)));
	});

	let stderr = new Promise<string>((resolve, reject) => {
		let buffers: Buffer[] = [];
		on(child.stderr, 'data', b => buffers.push(b));
		once(child.stderr, 'close', () => resolve(decode(Buffer.concat(buffers), encoding)));
	});

	return Promise.all([ exitCode, stdout, stderr ]).then((values:any[]):IExecutionResult => {
		dispose(disposables);

		return {
			exitCode: values[0],
			stdout: values[1],
			stderr: values[2]
		};
	});
}

export function stream(child: ChildProcess, progress: StreamOutput, encoding = 'utf8'): Promise<IExecutionResult> {
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

	let stdout = new Promise<string>((resolve, reject) => {
		let buffers: Buffer[] = [];
		on(child.stdout, 'data', b => {
			buffers.push(b);
			progress(decode(b, encoding));
		});
		once(child.stdout, 'close', () => resolve(decode(Buffer.concat(buffers), encoding)));
	});

	let stderr = new Promise<string>((resolve, reject) => {
		let buffers: Buffer[] = [];
		on(child.stderr, 'data', b => {
			buffers.push(b);
			progress(decode(b, encoding));
		});
		once(child.stderr, 'close', () => resolve(decode(Buffer.concat(buffers), encoding)));
	});

	return Promise.all([ exitCode, stdout, stderr ]).then((values:any[]):IExecutionResult => {
		dispose(disposables);

		return {
			exitCode: values[0],
			stdout: values[1],
			stderr: values[2]
		};
	});
}