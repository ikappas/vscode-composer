/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import { workspace } from 'vscode';
import { IExecutionResult, exec, stream, SpawnOptions, StreamOutput } from '../helpers/execution';
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
	 * Get the stream output handler.
	 */
	protected get streamOutputHandler(): StreamOutput {
		return (output: string): void => {
			this.log(output);
		};
	}

	/**
	 * Short information about Composer.
	 */
  	public async about(): Promise<IExecutionResult> {
		return this.run(['about']);
	}

	/**
	 * Create an archive of this composer package.
	 */
	public async archive(...args:string[]): Promise<IExecutionResult> {
		return this.stream(['archive'].concat(args));
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
		return this.run(['clear-cache']);
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
		return this.stream(['diagnose']);
	}

	/**
	 * Dumps the autoloader.
	 */
	public async dumpAutoload(...args:string[]): Promise<IExecutionResult> {
		return this.stream(['dump-autoload'].concat(args));
	}

	/**
	 * Displays help for a command.
	 */
	public async help(command:string): Promise<IExecutionResult> {
		return this.run(['help', command]);
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
		return this.run(['init'].concat(args));
	}

	/**
	 * Installs the project dependencies from the composer.lock file if present, or falls back on the composer.json.
	 */
	public async install(): Promise<IExecutionResult> {
		return this.stream(['install']);
	}

	/**
	 * Show information about licenses of dependencies.
	 */
	public async licenses(): Promise<IExecutionResult> {
		return this.run(['licenses']);
	}

	/**
	 * Shows which packages prevent the given package from being installed
	 */
	public async prohibits(...args:string[]): Promise<IExecutionResult> {
		return this.stream(['prohibits'].concat(args));
	}

	/**
	 * Adds required packages to your composer.json and installs them.
	 */
	public async require(...args:string[]): Promise<IExecutionResult> {
		return this.stream(['require'].concat(args));
	}

	/**
	 * Removes a package from the require or require-dev.
	 */
	public async remove(...args:string[]): Promise<IExecutionResult> {
		return this.stream(['remove'].concat(args));
	}

	/**
	 * Run the scripts defined in composer.json.
	 */
	public async runScript(...args:string[]): Promise<IExecutionResult> {
		return this.stream(['run-script'].concat(args));
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
		return this.run(['self-update']);
	}

	/**
	 * Show information about packages.
	 */
	public async show(...args:string[]): Promise<IExecutionResult> {
		return this.run(['show'].concat(args));
	}

	/**
	 * Show a list of locally modified packages.
	 */
	public async status(): Promise<IExecutionResult> {
		return this.run(['status']);
	}

	/**
	 * Show package suggestions.
	 */
	public async suggests(): Promise<IExecutionResult> {
		return this.run(['suggests']);
	}

	/**
	 * Updates your dependencies to the latest version according to composer.json, and updates the composer.lock file.
	 */
	public async update(): Promise<IExecutionResult> {
		return this.stream(['update']);
	}

	/**
	 * Validates a composer.json and composer.lock
	 */
	public validate() {
		return this.stream(['validate']);
	}

	/**
	 * Shows the composer version.
	 */
	public async version(): Promise<IExecutionResult> {
		return this.run(['--version']);
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

	protected async run(args: string[], options: any = {}): Promise<IExecutionResult> {
		options = Object.assign({ cwd: this.workingPath, encoding: this.encoding }, options || {});
		return this.exec(args, options);
	}

	protected async stream(args: string[], options: any = {}): Promise<IExecutionResult> {
		options = Object.assign({ cwd: this.workingPath, encoding: this.encoding }, options || {});
		const child = this.spawn(args, options);
		return stream(child, this.streamOutputHandler, this.encoding).then(r => { this.log('\n'); return r; });
	}

	protected async exec(args: string[], options: any = {}): Promise<IExecutionResult> {
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

	protected spawn(args: string[], options: SpawnOptions = {}): ChildProcess {
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
