/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { CommandNames, ComposerCommandHandler } from './helpers/commands';
import { ComposerClient } from './clients/composer-client';
import { ComposerContext } from './contexts/composer-context';
import { ComposerSettings } from './helpers/settings';
import { Constants } from './helpers/constants';
import { Disposable, OutputChannel, window, workspace, commands, Uri } from 'vscode';
import { IExecutionResult } from './helpers/execution';
import { Strings } from './helpers/strings';

export class ComposerExtension extends Disposable {
	private channel: OutputChannel;
	private contexts: Map<Uri, ComposerContext> = new Map();
	private disposables: Disposable[] = [];

	constructor() {
		super(() => {
			this.disposables.map((d) => { d.dispose(); });
			this.channel.dispose();
		});

		this.channel = window.createOutputChannel(Constants.OutputChannel);

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

				context.onDidChangeClient(e => {
					e.client.onOutput(e => this.channel.append(e.output), this, this.disposables);
				});

				this.contexts.set(folder.uri, context);
			}
		}

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
		this.registerCommand(CommandNames.DumpAutoload, this.ensureComposerProject(this.commandDumpAutoload));
		this.registerCommand(CommandNames.Fund, this.ensureComposerProject(this.commandFund));
		this.registerCommand(CommandNames.Install, this.ensureComposerProject(this.commandInstall));
		this.registerCommand(CommandNames.Licenses, this.ensureComposerProject(this.commandLicenses));
		this.registerCommand(CommandNames.Outdated, this.ensureComposerProject(this.commandOutdated));
		this.registerCommand(CommandNames.Remove, this.ensureComposerProject(this.commandRemove));
		this.registerCommand(CommandNames.Require, this.ensureComposerProject(this.commandRequire));
		this.registerCommand(CommandNames.RunScript, this.ensureComposerProject(this.commandRunScript));
		this.registerCommand(CommandNames.SelfUpdate, this.commandSelfUpdate);
		this.registerCommand(CommandNames.Show, this.ensureComposerProject(this.commandShow));
		this.registerCommand(CommandNames.Status, this.ensureComposerProject(this.commandStatus));
		this.registerCommand(CommandNames.Update, this.ensureComposerProject(this.commandUpdate));
		this.registerCommand(CommandNames.Validate, this.ensureComposerProject(this.commandValidate));
		this.registerCommand(CommandNames.Version, this.commandVersion);
	}

	protected commandAbout({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.about);
	}

	protected commandArchive({ client }: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerArchiveInput, placeHolder: Strings.ComposerArchivePlaceHolder }).then(pkg => {
			if (typeof (pkg) !== 'undefined') {

				const args = (pkg !== String.Empty)
					? pkg.split(String.Space)
					: [];

				this.invokeCommand(client, c => c.archive, ...args);
			}
		});
	}

	protected commandClearCache({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.clearCache);
	}

	protected commandDiagnose({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.diagnose);
	}

	protected commandDumpAutoload({ client }: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerDumpAutoloadInput, placeHolder: Strings.ComposerDumpAutoloadPlaceHolder }).then(options => {
			if (typeof (options) !== 'undefined') {

				const args = (options !== String.Empty)
					? options.split(String.Space)
					: [];

				this.invokeCommand(client, c => c.dumpAutoload, ...args);
			}
		});
	}

	protected commandFund({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.fund);
	}

	protected commandInstall({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.install);
	}

	protected commandLicenses({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.licenses);
	}

	protected commandOutdated({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.outdated);
	}

	protected commandRemove({ client }: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerRemoveInput, placeHolder: Strings.ComposerRemovePlaceHolder }).then(options => {
			if (typeof (options) !== 'undefined' && options !== String.Empty) {
				const args = options.split(String.Space);
				this.invokeCommand(client, c => c.remove, ...args);
			}
		});
	}

	protected commandRequire({ client }: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerRequireInput, placeHolder: Strings.ComposerRequirePlaceHolder }).then(options => {
			if (typeof (options) !== 'undefined' && options !== String.Empty) {
				const args = options.split(String.Space);
				this.invokeCommand(client, c => c.require, ...args);
			}
		});
	}

	protected commandRunScript({ client }: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerRunScriptInput, placeHolder: Strings.ComposerRunScriptPlaceHolder }).then(options => {
			if (typeof (options) !== 'undefined' && options !== String.Empty) {
				const args = options.split(String.Space);
				this.invokeCommand(client, c => c.runScript, ...args);
			}
		});
	}

	protected commandSelfUpdate({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.selfUpdate);
	}

	protected commandShow({ client }: ComposerContext): void {
		window.showInputBox({ prompt: Strings.ComposerShowInput, placeHolder: Strings.ComposerShowPlaceHolder }).then(options => {
			if (typeof (options) !== 'undefined') {

				const args = (options !== String.Empty)
					? options.split(String.Space)
					: [];

				this.invokeCommand(client, c => c.show, ...args);
			}
		});
	}

	protected commandStatus({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.status);
	}

	protected commandUpdate({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.update);
	}

	protected commandValidate({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.validate);
	}

	protected commandVersion({ client }: ComposerContext): void {
		this.invokeCommand(client, c => c.version);
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

	private ensureComposerProject(callback: ComposerCommandHandler): ComposerCommandHandler {
		return (context: ComposerContext, ...args: any[]) => {
			if (context.isComposerProject()) {
				args.unshift(context);
				return callback.apply(this, args);
			}
			window.showInformationMessage(Strings.ComposerProjectRequired);
		};
	}

	private async invokeCommand(client: ComposerClient, commandResolver: (client: ComposerClient) => (...args: any[]) => Promise<IExecutionResult>, ...args: any[]): Promise<void> {
		const commandExecutor = commandResolver(client);

		this.channel.show();

		await commandExecutor.apply(client, args)
			.then(() => {
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
		const contextCallback = this.ensureComposerContext(this.safeExecute(callback));
		this.disposables.push(commands.registerCommand(command, contextCallback, thisArg));
	}
}
