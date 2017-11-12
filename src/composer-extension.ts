/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { Disposable, OutputChannel, window, workspace, commands, Uri } from 'vscode';
import { IExecutionResult } from './helpers/execution';
import { ComposerGlobalSettings } from './helpers/settings';
import { Strings } from './helpers/strings';
import { Constants } from './helpers/constants';
import { ComposerContext } from './contexts/composer-context';
import { CommandNames, ComposerCommandHandler } from './helpers/commands';

export class ComposerExtension extends Disposable {
	private channel: OutputChannel;
	private contexts: Map<Uri, ComposerContext> = new Map();
	private disposables: Disposable[] = [];

	constructor() {
		super(() => {
			this.disposables.map((d)=>{d.dispose();});
		});

		this.initializeExtension();

		// Add the event listener for settings changes, then re-initialized the extension
		workspace.onDidChangeConfiguration(() => {
			this.reinitialize();
		});

		 // Add the event listener for workspace changes, then re-initialized the extension
		workspace.onDidChangeWorkspaceFolders(() => {
			this.reinitialize();
		});
	}

	// Reinitialize the extension when coming back online
	public reinitialize(): void {
		this.dispose();
		this.initializeExtension();
	}

	private initializeExtension(): void {
		this.contexts.clear();

		let globalSettings = new ComposerGlobalSettings();
		if (globalSettings.enabled && workspace.workspaceFolders) {

			// Process each workspace folder
			for (let folder of workspace.workspaceFolders) {
				let context = new ComposerContext(folder);

				context.onDidChangeClient( e => {
					this.disposables.push(e.client.onOutput(o => { this.channel.append(o); }));
				});

				this.contexts.set(folder.uri, context );
			}
		}

		this.channel = window.createOutputChannel(Constants.OutputChannel);
		this.disposables.push(this.channel);

		this.registerCommands();
	}

	/**
	 * Initialize Command handlers.
	 */
	private registerCommands(): void {
		this.registerCommand(CommandNames.About, this.commandAbout);
		this.registerCommand(CommandNames.Archive, this.ensureComposerProject(this.commandArchive));
		this.registerCommand(CommandNames.ClearCache, this.commandClearCache);
		this.registerCommand(CommandNames.Diagnose, this.commandDiagnose);
		this.registerCommand(CommandNames.DumpAutoload, this.commandDumpAutoload);
		this.registerCommand(CommandNames.Install, this.ensureComposerProject(this.commandInstall));
		this.registerCommand(CommandNames.Remove, this.ensureComposerProject(this.commandRemove));
		this.registerCommand(CommandNames.Require, this.ensureComposerProject(this.commandRequire));
		this.registerCommand(CommandNames.RunScript, this.ensureComposerProject(this.commandRunScript));
		this.registerCommand(CommandNames.SelfUpdate, this.commandSelfUpdate);
		this.registerCommand(CommandNames.Show, this.commandShow);
		this.registerCommand(CommandNames.Status, this.ensureComposerProject(this.commandStatus));
		this.registerCommand(CommandNames.Update, this.ensureComposerProject(this.commandUpdate));
		this.registerCommand(CommandNames.Validate, this.ensureComposerProject(this.commandValidate));
		this.registerCommand(CommandNames.Version, this.commandVersion);
	}

	protected commandAbout(context: ComposerContext): void {
		this.reportExecutionResult(context.client.about());
	}

	protected commandArchive(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerArchiveInput, placeHolder: Strings.ComposerArchivePlaceHolder }).then(pkg => {
			if (typeof (pkg) !== 'undefined') {

				let args = (pkg !== String.Empty)
					? pkg.split(String.Space)
					: [];

				this.reportExecutionResult(context.client.archive.apply(context.client, args));
			}
		});
	}

	protected commandClearCache(context: ComposerContext): void {
		this.reportExecutionResult(context.client.clearCache());
	}

	protected commandDiagnose(context: ComposerContext): void {
		this.reportExecutionResult(context.client.diagnose());
	}

	protected commandDumpAutoload(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerDumpAutoloadInput, placeHolder: Strings.ComposerDumpAutoloadPlaceHolder }).then(options => {
			if (typeof (options) !== 'undefined') {

				let args = (options !== String.Empty)
					? options.split(String.Space)
					: [];

				this.reportExecutionResult(context.client.dumpAutoload.apply(context.client, args));
			}
		});
	}

	protected commandInstall(context: ComposerContext): void {
		this.reportExecutionResult(context.client.install());
	}

	protected commandRemove(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerRemoveInput, placeHolder: Strings.ComposerRemovePlaceHolder }).then(options => {
			if (typeof (options) !== 'undefined' && options !== String.Empty) {
				let args = options.split(String.Space);
				this.reportExecutionResult(context.client.remove.apply(context.client, args));
			}
		});
	}

	protected commandRequire(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerRequireInput, placeHolder: Strings.ComposerRequirePlaceHolder }).then(options => {
			if (typeof (options) !== 'undefined' && options !== String.Empty) {
				let args = options.split(String.Space);
				this.reportExecutionResult(context.client.require.apply(context.client, args));
			}
		});
	}

	protected commandRunScript(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerRunScriptInput, placeHolder: Strings.ComposerRunScriptPlaceHolder }).then(options => {
			if (typeof (options) !== 'undefined' && options !== String.Empty) {
				let args = options.split(String.Space);
				this.reportExecutionResult(context.client.runScript.apply(context.client, args));
			}
		});
	}

	protected commandSelfUpdate(context: ComposerContext): void {
		this.reportExecutionResult(context.client.selfUpdate());
	}

	protected commandShow(context: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerShowInput, placeHolder: Strings.ComposerShowPlaceHolder }).then(options => {
			if (typeof (options) !== 'undefined') {

				let args = (options !== String.Empty)
					? options.split(String.Space)
					: [];

				this.reportExecutionResult(context.client.show.apply(context.client, args));
			}
		});
	}

	protected commandStatus(context: ComposerContext): void {
		this.reportExecutionResult(context.client.status());
	}

	protected commandUpdate(context: ComposerContext): void {
		this.reportExecutionResult(context.client.update());
	}

	protected commandValidate(context: ComposerContext): void {
		this.reportExecutionResult(context.client.validate());
	}

	protected commandVersion(context: ComposerContext): void {
		this.reportExecutionResult(context.client.version());
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
					window.showWorkspaceFolderPick({ placeHolder: Strings.QuickPickWorkspaceFolder }).then((folder) => {
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
				this.channel.show();
				args.unshift(context);
				return callback.apply(this, args);
			} catch (error) {
				window.showErrorMessage(error.message);
			}
		};
	}

	private ensureComposerProject(callback: ComposerCommandHandler): ComposerCommandHandler {
		return (context: ComposerContext, ...args: any[]) => {
			if (context.isComposerProject()) {
				args.unshift(context);
				return callback.apply(this, args);
			}
			window.showInformationMessage(Strings.ComposerProjectRequired);
		};
	}

	private reportExecutionResult(result: Promise<IExecutionResult>): void {
		result.then(() => {
			if (this.channel) {
				this.channel.appendLine(Strings.CommandCompletedSuccessfully + '\n');
			}
		}, () => {
			if (this.channel) {
				this.channel.appendLine(Strings.CommandCompletedWithErrors + '\n');
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
	private registerCommand(command: string, callback: ComposerCommandHandler, thisArg?: any): void {
		let contextCallback = this.ensureComposerContext(this.safeExecute(callback));
		this.disposables.push(commands.registerCommand(command, contextCallback, thisArg));
	}
}
