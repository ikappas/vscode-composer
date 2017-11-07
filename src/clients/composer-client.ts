/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import { workspace } from 'vscode';
import { IExecutionResult, exec, stream, SpawnOptions } from '../helpers/execution';
import { spawn, ChildProcess } from 'child_process';
import { Strings } from '../helpers/strings';
import iconv = require('iconv-lite');

export interface ComposerOptions {
	executablePath: string;
	encoding?: string;
	env?: any;
}

export class ComposerClient {
	private _executablePath: string;
	private _workingPath: string;
	private _encoding: string;

	public env: any;
	private outputListeners: { (output: string): void; }[];

	constructor(options: ComposerOptions) {

		this._executablePath = options.executablePath;
		this._workingPath = workspace.rootPath;

		const encoding = options.encoding || 'utf8';
		this._encoding = iconv.encodingExists(encoding) ? encoding : 'utf8';

		this.env = options.env || {};
		this.outputListeners = [];
	}

	/**
	 * Get the composer executable path.
	 */
	public get executablePath() {
		return this._executablePath;
	}

	/**
	 * Get the composer working path.
	 */
	public get workingPath() {
		return this._workingPath;
	}

	/**
	 * Get the encoding to use.
	 */
	public get encoding() {
		return this._encoding;
	}

	/**
	 * Short information about Composer.
	 */
  	public async about(): Promise<IExecutionResult> {
		return this.run(this.workingPath, ['about']);
	}

	/**
	 * Create an archive of this composer package.
	 */
	public async archive(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(this.workingPath, ['archive'].concat(args), { encoding: this.encoding });
		return stream(child, output => {
			this.log(output);
		}, this.encoding).then(r => { this.log('\n'); return r; });
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
	public async clearCache(): Promise<IExecutionResult> {
		return this.run(this.workingPath, ['clear-cache'], { encoding: this.encoding });
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
	public depends(_pkg: string, _recursive = false, _tree = false) {
		// TODO: implement "depends".
	}

	/**
	 * Diagnoses the system to identify common errors.
	 */
	public diagnose() {
		const child = this.stream(this.workingPath, ['diagnose'], { encoding: this.encoding });
		return stream(child, output => {
			this.log(output);
		}, this.encoding).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Dumps the autoloader.
	 */
	public async dumpAutoload(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(this.workingPath, ['dump-autoload'].concat(args), { encoding: this.encoding });
		return stream(child, output => {
			this.log(output);
		}, this.encoding).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Displays help for a command.
	 */
	public async help(command:string): Promise<IExecutionResult> {
		return this.run(this.workingPath, ['help', command], { encoding: this.encoding });
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
	public async init(...args:string[]): Promise<IExecutionResult> {
		return this.run(this.workingPath, ['init'].concat(args), { encoding: this.encoding });
	}

	/**
	 * Installs the project dependencies from the composer.lock file if present, or falls back on the composer.json.
	 */
	public async install(): Promise<IExecutionResult> {
		const child = this.stream(this.workingPath, ['install'], { encoding: this.encoding });
		return stream(child, output => {
			this.log(output);
		}, this.encoding).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Show information about licenses of dependencies.
	 */
	public async licenses(): Promise<IExecutionResult> {
		return this.run(this.workingPath, ['licenses'], { encoding: this.encoding });
	}

	/**
	 * Shows which packages prevent the given package from being installed
	 */
	public async prohibits(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(this.workingPath, ['prohibits'].concat(args), { encoding: this.encoding });
		return stream(child, output => {
			this.log(output);
		}, this.encoding).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Adds required packages to your composer.json and installs them.
	 */
	public async require(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(this.workingPath, ['require'].concat(args), { encoding: this.encoding });
		return stream(child, output => {
			this.log(output);
		}, this.encoding);
	}

	/**
	 * Removes a package from the require or require-dev.
	 */
	public async remove(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(this.workingPath, ['remove'].concat(args), { encoding: this.encoding });
		return stream(child, output => {
			this.log(output);
		}, this.encoding).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Run the scripts defined in composer.json.
	 */
	public async runScript(...args:string[]): Promise<IExecutionResult> {
		const child = this.stream(this.workingPath, ['run-script'].concat(args), { encoding: this.encoding });
		return stream(child, output => {
			this.log(output);
		}, this.encoding).then(r => { this.log('\n'); return r; });
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
	public async selfUpdate(): Promise<IExecutionResult> {
		return this.run(this.workingPath, ['self-update'], { encoding: this.encoding });
	}

	/**
	 * Show information about packages.
	 */
	public async show(...args:string[]): Promise<IExecutionResult> {
		return this.run(this.workingPath, ['show'].concat(args), { encoding: this.encoding });
	}

	/**
	 * Show a list of locally modified packages.
	 */
	public async status(): Promise<IExecutionResult> {
		return this.run(this.workingPath, ['status'], { encoding: this.encoding });
	}

	/**
	 * Show package suggestions.
	 */
	public async suggests(): Promise<IExecutionResult> {
		return this.run(this.workingPath, ['suggests'], { encoding: this.encoding });
	}

	/**
	 * Updates your dependencies to the latest version according to composer.json, and updates the composer.lock file.
	 */
	public async update(): Promise<IExecutionResult> {
		const child = this.stream(this.workingPath, ['update'], { encoding: this.encoding });
		return stream(child, output => {
			this.log(output);
		}, this.encoding).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Validates a composer.json and composer.lock
	 */
	public validate() {
		const child = this.stream(this.workingPath, ['validate'], { encoding: this.encoding });
		return stream(child, output => {
			this.log(output);
		}, this.encoding).then(r => { this.log('\n'); return r; });
	}

	/**
	 * Shows the composer version.
	 */
	public async version(): Promise<IExecutionResult> {
		return this.run(this.workingPath, ['--version'], { encoding: this.encoding });
	}

	/**
	 * Shows which packages cause the given package to be installed.
	 */
	public why(_pkg:string) {
		// TODO: Implement "why".
	}

	/**
	 * Shows which packages prevent the given package from being installed.
	 */
	public whyNot(_pkg:string) {
		// TODO: Implement "why-not".
	}

	public async run(cwd: string, args: string[], options: any = {}): Promise<IExecutionResult> {
		options = Object.assign({ cwd: cwd }, options || {});
		return this.exec(args, options);
	}

	public stream(cwd: string, args: string[], options: any = {}): ChildProcess {
		options = Object.assign({ cwd: cwd }, options || {});
		return this.spawn(args, options);
	}

	private async exec(args: string[], options: any = {}): Promise<IExecutionResult> {
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

	public spawn(args: string[], options: SpawnOptions = {}): ChildProcess {
		if (!this.executablePath) {
			throw new Error(Strings.ComposerNotFound);
		}

		if (!options) {
			options = {};
		}

		if (!options.stdio && !options.input) {
			options.stdio = ['ignore', null, null]; // Unless provided, ignore stdin and leave default streams for stdout and stderr
		}

		options.env = Object.assign({}, options.env || {});
		options.env = Object.assign(options.env, this.env);

		if (options.log !== false) {
			this.log(String.format(Strings.WorkingDirectory + '\n', options.cwd));
			this.log(String.format(Strings.ExecutingCommand + '\n\n', args.join(' ')));
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
