/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import { workspace } from 'vscode';
import { IExecutionResult, exec, stream } from '../base/common/execution';
import { spawn, ChildProcess } from 'child_process';
import { encodingExists } from '../base/node/encoding';
import { Strings } from '../helpers/strings';

import objects = require('../base/common/objects');
import strings = require('../base/common/strings');

export interface ComposerOptions {
	executablePath:string;
	defaultEncoding?: string;
	env?:any;
}

export class ComposerClient {
	public executablePath: string;
	public env: any;
	private defaultEncoding: string;
	private outputListeners: { (output: string): void; }[];

	constructor(options: ComposerOptions) {

		this.executablePath = options.executablePath;

		const encoding = options.defaultEncoding || 'utf8';
		this.defaultEncoding = encodingExists(encoding) ? encoding : 'utf8';

		this.env = options.env || {};
		this.outputListeners = [];
	}

	/**
	 * Short information about Composer.
	 */
  	public about(): Promise<IExecutionResult> {
		return this.run(workspace.rootPath, ['about']);
	}

	/**
	 * Create an archive of this composer package.
	 */
	public archive(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(workspace.rootPath, ['archive'].concat(args));
		return stream(child, (output) => {
			this.log(output);
		}).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Opens the package's repository URL or homepage in your browser.
	 */
	public browse() {
		// TODO: implement "browse".
	}

	/**
	 * Clears composer's internal package cache.
	 */
	public clearCache(): Promise<IExecutionResult> {
		return this.run(workspace.rootPath, ['clear-cache']);
	}

	/**
	 * Set config options.
	 */
	public config() {
		// TODO: implement "config".
	}

	/**
	 * Create new project from a package into given directory.
	 */
	public createProject() {
		// TODO: implement "create-project".
	}

	/**
	 * Shows which packages cause the given package to be installed.
	 */
	public depends(pkg:string, recursive=false, tree=false) {
		// TODO: implement "depends".
	}

	/**
	 * Diagnoses the system to identify common errors.
	 */
	public diagnose() {
		const child = this.stream(workspace.rootPath, ['diagnose']);
		return stream(child, (output) => {
			this.log(output);
		}).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Dumps the autoloader.
	 */
	public dumpAutoload(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(workspace.rootPath, ['dump-autoload'].concat(args));
		return stream(child, (output) => {
			this.log(output);
		}).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Displays help for a command.
	 */
	public help(command:string): Promise<IExecutionResult> {
		return this.run(workspace.rootPath, ['help', command]);
	}

	/**
	 * Opens the package's repository URL or homepage in your browser.
	 */
	public home() {
		// TODO: implement "home".
	}

	/**
	 * Creates a basic composer.json file in current directory.
	 */
	public init(...args:string[]): Promise<IExecutionResult> {
		return this.run(workspace.rootPath, ['init'].concat(args));
	}

	/**
	 * Installs the project dependencies from the composer.lock file if present, or falls back on the composer.json.
	 */
	public install(): Promise<IExecutionResult> {
		const child = this.stream(workspace.rootPath, ['install']);
		return stream(child, (output) => {
			this.log(output);
		}).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Show information about licenses of dependencies.
	 */
	public licenses(): Promise<IExecutionResult> {
		return this.run(workspace.rootPath, ['licenses']);
	}

	/**
	 * Shows which packages prevent the given package from being installed
	 */
	public prohibits(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(workspace.rootPath, ['prohibits'].concat(args));
		return stream(child, (output) => {
			this.log(output);
		}).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Adds required packages to your composer.json and installs them.
	 */
	public require(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(workspace.rootPath, ['require'].concat(args));
		return stream(child, (output) => {
			this.log(output);
		});
	}

	/**
	 * Removes a package from the require or require-dev.
	 */
	public remove(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(workspace.rootPath, ['remove'].concat(args));
		return stream(child, (output) => {
			this.log(output);
		}).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Run the scripts defined in composer.json.
	 */
	public runScript(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(workspace.rootPath, ['run-script'].concat(args));
		return stream(child, (output) => {
			this.log(output);
		}).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Search for packages.
	 */
	public search() {
		// TODO: Implement "search".
	}

	/**
	 * Updates composer.phar to the latest version.
	 */
	public selfUpdate(): Promise<IExecutionResult> {
		return this.run(workspace.rootPath, ['self-update']);
	}

	/**
	 * Show information about packages.
	 */
	public show(...args:string[]): Promise<IExecutionResult> {
		return this.run(workspace.rootPath, ['show'].concat(args));
	}

	/**
	 * Show a list of locally modified packages.
	 */
	public status(): Promise<IExecutionResult> {
		return this.run(workspace.rootPath, ['status']);
	}

	/**
	 * Show package suggestions.
	 */
	public suggests(): Promise<IExecutionResult> {
		return this.run(workspace.rootPath, ['suggests']);
	}

	/**
	 * Updates your dependencies to the latest version according to composer.json, and updates the composer.lock file.
	 */
	public update(): Promise<IExecutionResult> {
		const child = this.stream(workspace.rootPath, ['update']);
		return stream(child, (output) => {
			this.log(output);
		}).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Validates a composer.json and composer.lock
	 */
	public validate() {
		const child = this.stream(workspace.rootPath, ['validate']);
		return stream(child, (output) => {
			this.log(output);
		}).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Shows the composer version.
	 */
	public version(): Promise<IExecutionResult> {
		return this.run(workspace.rootPath, ['--version']);
	}

	/**
	 * Shows which packages cause the given package to be installed.
	 */
	public why(pkg:string) {
		// TODO: Implement "why".
	}

	/**
	 * Shows which packages prevent the given package from being installed.
	 */
	public whyNot(pkg:string) {
		// TODO: Implement "why-not".
	}

	public run(cwd: string, args: string[], options: any = {}): Promise<IExecutionResult> {
		options = objects.assign({ cwd: cwd }, options || {});
		return this.exec(args, options);
	}

	public stream(cwd: string, args: string[], options: any = {}): ChildProcess {
		options = objects.assign({ cwd: cwd }, options || {});
		return this.spawn(args, options);
	}

	private exec(args: string[], options: any = {}): Promise<IExecutionResult> {
		const child = this.spawn(args, options);

		if (options.input) {
			child.stdin.end(options.input, 'utf8');
		}

		return exec(child).then(result => {

			if ( options.log !== false ) {
				if ( result.exitCode ) {
					this.log(`${result.stderr}\n`);
				} else if ( result.stderr ) {
					this.log(`${result.stderr}\n`);
				} else {
					this.log(`${result.stdout}\n`);
				}
			}

			return result;
		});
	}

	public spawn(args: string[], options: any = {}): ChildProcess {
		if (!this.executablePath) {
			throw new Error(Strings.ComposerNotFound);
		}

		if (!options) {
			options = {};
		}

		if (!options.stdio && !options.input) {
			options.stdio = ['ignore', null, null]; // Unless provided, ignore stdin and leave default streams for stdout and stderr
		}

		options.env = objects.assign({}, options.env || {});
		options.env = objects.assign(options.env, this.env);

		if (options.log !== false) {
			this.log(strings.format(Strings.ExecutingCommand + '\n\n', args.join(' ')));
		}

		return spawn(this.executablePath, args, options);
	}

	public onOutput(listener: (output: string) => void): () => void {
		this.outputListeners.push(listener);
		return () => this.outputListeners.splice(this.outputListeners.indexOf(listener), 1);
	}

	private log(output: string): void {
		this.outputListeners.forEach(l => l(output));
	}
}
