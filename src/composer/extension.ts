/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as cp from 'child_process';
import { runInTerminal } from 'run-in-terminal';
import { CommandNames } from '../helpers/commands';
import { ComposerContext } from './context';
import { ComposerSettings } from './settings';
import { Constants } from '../helpers/constants';
import { commands, Disposable, OutputChannel, Terminal, window, workspace, Uri } from 'vscode';
import { Strings } from '../helpers/strings';
import { ComposerError } from '../helpers/errors';

interface Process {
	process: cp.ChildProcess;
	command: string;
}

export interface ComposerCommandHandler {
	(context: ComposerContext, ...args: string[]): any;
}

export class ComposerExtension extends Disposable {
	private outputChannel: OutputChannel;
	private terminal: Terminal | null = null;
	private contexts: Map<Uri, ComposerContext> = new Map();
	private runningProcesses: Map<number, Process> = new Map();
	private disposables: Disposable[] = [];

	constructor() {
		super(() => {
			this.disposables.map((d) => { d.dispose(); });
			this.outputChannel?.dispose();
			this.terminal?.dispose();
		});

		this.outputChannel = window.createOutputChannel(Constants.OutputChannelName);

		this.initializeExtension();

		// Add an event listener for settings changes, upon which re-initialize the extension
		workspace.onDidChangeConfiguration(() => {
			this.reinitialize();
		});

		// Add an event listener for workspace changes, upon which re-initialize the extension
		workspace.onDidChangeWorkspaceFolders(() => {
			this.reinitialize();
		});

		// Add an event listener for terminal close, upon which to release our terminal
		window.onDidCloseTerminal((closedTerminal: Terminal) => {
			if (this.terminal === closedTerminal) {
				this.terminal = null;
			}
		});
	}

	// Reinitialize the extension when coming back online
	public reinitialize(): void {
		this.disposables.map((d) => { d.dispose(); });
		this.initializeExtension();
	}

	private initializeExtension(): void {
		this.contexts.clear();

		const globalSettings = new ComposerSettings();
		if (globalSettings.enabled && workspace.workspaceFolders) {

			// Process each workspace folder
			for (const folder of workspace.workspaceFolders) {
				const context = new ComposerContext(folder);
				this.contexts.set(folder.uri, context);
			}
		}

		this.registerCommands();
	}

	/**
	 * Initialize Command handlers.
	 */
	private registerCommands(): void {
		this.registerCommand(CommandNames.About, this.runCommandAbout);
		this.registerCommand(CommandNames.Archive, this.runCommandArchive);
		// this.registerCommand(CommandNames.Browse, this.runCommandBrowse);
		this.registerCommand(CommandNames.ClearCache, this.runCommandClearCache);
		// this.registerCommand(CommandNames.Config, this.runCommandConfig);
		// this.registerCommand(CommandNames.CreateProject, this.runCommandCreateProject);
		this.registerCommand(CommandNames.Depends, this.runCommandDepends);
		this.registerCommand(CommandNames.Diagnose, this.runCommandDiagnose);
		this.registerCommand(CommandNames.DumpAutoload, this.runCommandDumpAutoload);
		this.registerCommand(CommandNames.Fund, this.runCommandFund);
		// this.registerCommand(CommandNames.Help, this.runCommandHelp);
		// this.registerCommand(CommandNames.Home, this.runCommandHome);
		this.registerCommand(CommandNames.Init, this.runCommandInit);
		this.registerCommand(CommandNames.Install, this.runCommandInstall);
		this.registerCommand(CommandNames.Licenses, this.runCommandLicenses);
		this.registerCommand(CommandNames.Outdated, this.runCommandOutdated);
		this.registerCommand(CommandNames.Prohibits, this.runCommandProhibits);
		this.registerCommand(CommandNames.Remove, this.runCommandRemove);
		this.registerCommand(CommandNames.Require, this.runCommandRequire);
		this.registerCommand(CommandNames.RunScript, this.runCommandRunScript);
		// this.registerCommand(CommandNames.Search, this.runCommandSearch);
		this.registerCommand(CommandNames.SelfUpdate, this.runCommandSelfUpdate);
		this.registerCommand(CommandNames.Show, this.runCommandShow);
		this.registerCommand(CommandNames.Status, this.runCommandStatus);
		this.registerCommand(CommandNames.Suggests, this.runCommandSuggests);
		this.registerCommand(CommandNames.Update, this.runCommandUpdate);
		this.registerCommand(CommandNames.Validate, this.runCommandValidate);
		this.registerCommand(CommandNames.Version, this.runCommandVersion);
		this.registerCommand(CommandNames.Why, this.runCommandWhy);
		this.registerCommand(CommandNames.WhyNot, this.runCommandWhyNot);
	}

	/**
	 * Short information about Composer.
	 */
	protected runCommandAbout(context: ComposerContext): void {
		this.runCommand(['about'], context, false);
	}

	/**
	 * Create an archive of this composer package.
	 */
	protected runCommandArchive(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerArchiveInput, placeHolder: Strings.ComposerArchivePlaceHolder })
			.then(pkg => {
				if (typeof (pkg) !== 'undefined') {

					const args = (pkg !== String.Empty)
						? pkg.split(String.Space)
						: [];

					this.runCommand(['archive', ...args], context);
				}
			});
	}

	/**
	 * Opens the package's repository URL or homepage in your browser.
	 */
	protected runCommandBrowse(_context: ComposerContext): void {
		// TODO: implement "browse".
		throw new ComposerError({
			message: String.format(Strings.ComposerCommandNotImplemented, 'browse')
		});
	}

	/**
	 * Clears composer's internal package cache.
	 */
	protected runCommandClearCache(context: ComposerContext): void {
		this.runCommand(['clear-cache'], context, false);
	}

	/**
	 * Set config options.
	 */
	protected runCommandConfig(_context: ComposerContext): void {
		// TODO: implement "config".
		throw new ComposerError({
			message: String.format(Strings.ComposerCommandNotImplemented, 'config')
		});
	}

	/**
	 * Create new project from a package into given directory.
	 */
	protected runCommandCreateProject(_context: ComposerContext): void {
		// TODO: implement "create-project".
		throw new ComposerError({
			message: String.format(Strings.ComposerCommandNotImplemented, 'create-project')
		});
	}

	/**
	 * Shows which packages cause the given package to be installed.
	 */
	protected runCommandDepends(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerDependsInput, placeHolder: Strings.ComposerDependsPlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined' && options !== String.Empty) {
					const args = options.split(String.Space);
					this.runCommand(['depends', ...args], context);
				}
			});
	}

	/**
	 * Diagnoses the system to identify common errors.
	 */
	protected runCommandDiagnose(context: ComposerContext): void {
		this.runCommand(['diagnose'], context, false);
	}

	/**
	 * Dumps the autoloader.
	 */
	protected runCommandDumpAutoload(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerDumpAutoloadInput, placeHolder: Strings.ComposerDumpAutoloadPlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined') {

					const args = (options !== String.Empty)
						? options.split(String.Space)
						: [];

					this.runCommand(['dump-autoload', ...args], context);
				}
			});
	}

	/**
	 * Discover how to help fund the maintenance of your dependencies.
	 */
	protected runCommandFund(context: ComposerContext): void {
		this.runCommand(['fund'], context);
	}

	/**
	 * Displays help for a command.
	 */
	protected runCommandHelp(_context: ComposerContext): void {
		// TODO: implement "help".
		throw new ComposerError({
			message: String.format(Strings.ComposerCommandNotImplemented, 'help')
		});
	}

	/**
	 * Opens the package's repository URL or homepage in your browser.
	 */
	protected runCommandHome(_context: ComposerContext): void {
		// TODO: implement "home".
		throw new ComposerError({
			message: String.format(Strings.ComposerCommandNotImplemented, 'home')
		});
	}

	/**
	 * Creates a basic composer.json file in current directory.
	 */
	protected runCommandInit(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerInitInput, placeHolder: Strings.ComposerInitPlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined' && options !== String.Empty) {
					const args = options.split(String.Space);
					this.runCommand(['init', ...args], context, false);
				}
			});
	}

	/**
	 * Installs the project dependencies from the composer.lock file if present, or falls back on the composer.json.
	 */
	protected runCommandInstall(context: ComposerContext): void {
		this.runCommand(['install'], context);
	}

	/**
	 * Shows information about licenses of dependencies.
	 */
	protected runCommandLicenses(context: ComposerContext): void {
		this.runCommand(['licenses'], context);
	}

	/**
	 * Shows a list of installed packages that have updates available, including their current and latest versions.
	 */
	protected runCommandOutdated(context: ComposerContext): void {
		this.runCommand(['outdated'], context);
	}

	/**
	 * Shows which packages prevent the given package from being installed
	 */
	protected runCommandProhibits(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerProhibitsInput, placeHolder: Strings.ComposerProhibitsPlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined' && options !== String.Empty) {
					const args = options.split(String.Space);
					this.runCommand(['prohibits', ...args], context);
				}
			});
	}

	/**
	 * Removes a package from the require or require-dev.
	 */
	protected runCommandRemove(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerRemoveInput, placeHolder: Strings.ComposerRemovePlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined' && options !== String.Empty) {
					const args = options.split(String.Space);
					this.runCommand(['remove', ...args], context);
				}
			});
	}

	/**
	 * Adds required packages to your composer.json and installs them.
	 */
	protected runCommandRequire(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerRequireInput, placeHolder: Strings.ComposerRequirePlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined' && options !== String.Empty) {
					const args = options.split(String.Space);
					this.runCommand(['require', ...args], context);
				}
			});
	}

	/**
	 * Run the scripts defined in composer.json.
	 */
	protected runCommandRunScript(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerRunScriptInput, placeHolder: Strings.ComposerRunScriptPlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined' && options !== String.Empty) {
					const args = options.split(String.Space);
					this.runCommand(['run-script', ...args], context);
				}
			});
	}

	/**
	 * Search for packages.
	 */
	protected runCommandSearch(_context: ComposerContext): void {
		// TODO: Implement "search".
		throw new ComposerError({
			message: String.format(Strings.ComposerCommandNotImplemented, 'search')
		});
	}

	/**
	 * Updates composer.phar to the latest version.
	 */
	protected runCommandSelfUpdate(context: ComposerContext): void {
		this.runCommand(['self-update'], context, false);
	}

	/**
	 * Show information about packages.
	 */
	protected runCommandShow(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerShowInput, placeHolder: Strings.ComposerShowPlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined') {

					const args = (options !== String.Empty)
						? options.split(String.Space)
						: [];

					this.runCommand(['show', ...args], context);
				}
			});
	}

	/**
	 * Show a list of locally modified packages.
	 */
	protected runCommandStatus(context: ComposerContext): void {
		this.runCommand(['status'], context);
	}

	/**
	 * Show package suggestions.
	 */
	protected runCommandSuggests(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerSuggestsInput, placeHolder: Strings.ComposerSuggestsPlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined') {

					const args = (options !== String.Empty)
						? options.split(String.Space)
						: [];

					this.runCommand(['suggests', ...args], context);
				}
			});
	}

	/**
	 * Updates your dependencies to the latest version according to composer.json, and updates the composer.lock file.
	 */
	protected runCommandUpdate(context: ComposerContext): void {
		this.runCommand(['update'], context);
	}

	/**
	 * Validates a composer.json and composer.lock
	 */
	protected runCommandValidate(context: ComposerContext): void {
		this.runCommand(['validate'], context);
	}

	/**
	 * Shows the composer version.
	 */
	protected runCommandVersion(context: ComposerContext): void {
		this.runCommand(['--version'], context, false);
	}

	/**
	 * Shows which packages cause the given package to be installed.
	 */
	protected runCommandWhy(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerWhyInput, placeHolder: Strings.ComposerWhyPlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined' && options !== String.Empty) {
					const args = options.split(String.Space);
					this.runCommand(['why', ...args], context);
				}
			});
	}

	/**
	 * Shows which packages prevent the given package from being installed.
	 */
	protected runCommandWhyNot(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerWhyNotInput, placeHolder: Strings.ComposerWhyNotPlaceHolder })
			.then(options => {
				if (typeof (options) !== 'undefined' && options !== String.Empty) {
					const args = options.split(String.Space);
					this.runCommand(['why-not', ...args], context);
				}
			});
	}

	/**
	 * Registers a command that can be invoked via a keyboard shortcut,
	 * a menu item, an action, or directly.
	 *
	 * Registering a command with an existing command identifier twice
	 * will cause an error.
	 *
	 * @param command A unique identifier for the command.
	 * @param callback A command handler function.
	 * @param thisArg The `this` context used when invoking the handler function.
	 */
	protected registerCommand(command: string, callback: ComposerCommandHandler, thisArg?: any): void {
		const contextCallback = this.ensureComposerContext(this.safeExecute(callback));
		this.disposables.push(commands.registerCommand(command, contextCallback, thisArg));
	}

	protected runCommand(args: string[], context: ComposerContext, ensureComposerProject: boolean = true): void {

		// Ensure that composer executable path is set.
		if (!context.settings.executablePath) {
			throw new ComposerError({
				message: Strings.ComposerExecutablePathRequired
			});
		}

		// Ensure the command is run against a composer project
		if (ensureComposerProject && !context.isComposerProject()) {
			window.showInformationMessage(Strings.ComposerProjectRequired);
			return;
		}

		// Opt-In the command is run quiet mode
		if (context.settings.runQuiet) {
			args.push('--quiet');
		}

		// Opt-In the command ignores platform requirements
		if (context.settings.ignorePlatformReqs && args[0] && ['dump-autoload', 'install', 'outdated', 'remove', 'require', 'show', 'update',].indexOf(args[0]) > -1) {
			args.push('--ignore-platform-reqs');
		}

		workspace.saveAll().then(() => {
			// Opt-In the command is run in a terminal
			if (context.settings.runInTerminal) {
				if (typeof window.createTerminal === 'function') {
					this.runCommandInIntegratedTerminal(args, context);
				} else {
					this.runCommandInTerminal(args, context);
				}
			} else {
				this.outputChannel.clear();
				this.runCommandInOutputWindow(args, context);
			}
		});
	}

	private runCommandInOutputWindow(args: string[], context: ComposerContext): void {
		const commandArgs = Array.from(args);

		// Disable progress on specific commands
		if (commandArgs[0] && ['install', 'update'].indexOf(commandArgs[0]) > -1) {
			commandArgs.unshift('--no-progress');
		}

		// Disable ansi output
		commandArgs.unshift('--no-ansi');

		const commandString = [context.settings.executablePath, ...commandArgs].join(' ');
		const commandProcess = cp.exec(commandString, { cwd: context.workingPath, env: process.env });

		this.runningProcesses.set(commandProcess.pid, { process: commandProcess, command: commandString });

		commandProcess.stderr.on('data', (data: string) => {
			this.outputChannel.append(data);
		});

		commandProcess.stdout.on('data', (data: string) => {
			this.outputChannel.append(data);
		});

		commandProcess.on('exit', (code: number, signal: string) => {
			this.runningProcesses.delete(commandProcess.pid);
			this.outputChannel.appendLine('');

			let statusMessage: string;
			if (signal === 'SIGTERM') {
				statusMessage = Strings.CommandKilledSuccessfully;
			} else {
				statusMessage = code == 0
					? Strings.CommandCompletedSuccessfully
					: Strings.CommandCompletedWithErrors;
			}

			this.outputChannel.appendLine(statusMessage)
			this.outputChannel.appendLine('');
		});

		this.outputChannel.show();
		this.outputChannel.appendLine(String.format(Strings.WorkingDirectory, context.workingPath));
		this.outputChannel.appendLine(String.format(Strings.ExecutingCommand, commandArgs.join(' ')));
		this.outputChannel.appendLine('');
	}

	private runCommandInTerminal(args: string[], context: ComposerContext): void {
		runInTerminal(context.settings.executablePath, args, { cwd: context.workingPath, env: process.env });
	}

	private runCommandInIntegratedTerminal(args: string[], context: ComposerContext): void {
		if (!this.terminal) {
			this.terminal = window.createTerminal(Constants.TerminalName);
		}

		this.terminal.show();

		const commandArgs = Array.from(args);

		commandArgs.unshift(context.settings.executablePath);

		// Ensure the command is run on the working path
		if (context.workingPath) {
			commandArgs.push('--working-dir', "'" + context.workingPath + "'");
		}

		this.terminal.sendText(commandArgs.join(' '));
	}

	/**
	 * Ensure that the callback will have a composer context.
	 * @param callback A composer command handler.
	 */
	private ensureComposerContext(callback: ComposerCommandHandler): ComposerCommandHandler {
		return (context: ComposerContext, ...args: any[]) => {
			switch (this.contexts.size) {
				case 0:
					window.showInformationMessage(Strings.ComposerContextRequired);
					break;

				case 1:
					context = this.contexts.values().next().value;
					args.unshift(context);
					return callback.apply(this, args);

				default:
					window.showWorkspaceFolderPick({ placeHolder: Strings.WorkspaceFolderPick }).then((folder) => {
						const context = this.contexts.get(folder.uri);
						if (context) {
							args.unshift(context);
							return callback.apply(this, args);
						}
					});
			}
		};
	}

	/**
	 * Safely execute a composer command handler.
	 * @param callback A composer command handler.
	 */
	private safeExecute(callback: ComposerCommandHandler): ComposerCommandHandler {
		return (context: ComposerContext, ...args: any[]) => {
			try {
				args.unshift(context);
				return callback.apply(this, args);
			} catch (error) {
				window.showErrorMessage(error.message);
			}
		};
	}
}
