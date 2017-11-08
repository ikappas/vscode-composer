/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { Disposable, OutputChannel, window, workspace, commands, Uri, QuickPickItem } from 'vscode';
import { IExecutionResult } from './helpers/execution';
import { ComposerGlobalSettings } from './helpers/settings';
import { CommandNames } from './helpers/constants';
import { Strings } from './helpers/strings';
import { Constants } from './helpers/constants';
import { ComposerContext } from './contexts/composer-context';
import { ComposerCommandHandler } from './helpers/commands';

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
		})
	}

	private initializeExtension(): void {
		this.contexts.clear();

		let globalSettings = new ComposerGlobalSettings();
		if (globalSettings.enabled && workspace.workspaceFolders) {

			// Process each workspace folder
			for (let folder of workspace.workspaceFolders) {
				let context = new ComposerContext(folder);

				context.onDidChangeClient( e => {
					e.client.onOutput(o => { this.channel.append(o); });
				})

				this.contexts.set(folder.uri, context );
			}
		}

		this.channel = window.createOutputChannel(Constants.OutputChannel);
		this.disposables.push(this.channel);

		this.initializeCommands();
	}

	/**
	 * Initialize Command handlers.
	 */
	private initializeCommands(): void {
		this.registerCommand(CommandNames.About, context => {
			this.reportExecutionResult(context.client.about());
		});
		this.registerCommand(CommandNames.Archive, context => {
			window.showInputBox({ prompt: Strings.ComposerArchiveInput, placeHolder: Strings.ComposerArchivePlaceHolder }).then( pkg => {
				if (typeof(pkg) !== 'undefined') {

					let args = ( pkg !== String.Empty )
							? pkg.split(String.Space)
							: [];

					this.reportExecutionResult(<Promise<IExecutionResult>> context.client.archive.apply(context.client, args));
				}
			});
		});
		this.registerCommand(CommandNames.ClearCache, context => {
			this.reportExecutionResult(context.client.clearCache());
		});
		this.registerCommand(CommandNames.Diagnose, context => {
			this.reportExecutionResult(context.client.diagnose());
		});
		this.registerCommand(CommandNames.DumpAutoload, context => {
			window.showInputBox({ prompt: Strings.ComposerDumpAutoloadInput, placeHolder: Strings.ComposerDumpAutoloadPlaceHolder }).then( options => {
				if (typeof(options) !== 'undefined') {

					let args = ( options !== String.Empty )
							? options.split(String.Space)
							: [];

					this.reportExecutionResult(<Promise<IExecutionResult>> context.client.dumpAutoload.apply(context.client, args));
				}
			});
		});
		this.registerCommand(CommandNames.Install, this.ensureComposerProject(context => {
			this.reportExecutionResult(context.client.install());
		}));
		this.registerCommand(CommandNames.Remove, this.ensureComposerProject(context => {
			window.showInputBox({ prompt: Strings.ComposerRemoveInput, placeHolder: Strings.ComposerRemovePlaceHolder }).then( options => {
				if (typeof(options) !== 'undefined' && options !== String.Empty ) {
					let args = options.split(String.Space);
					this.reportExecutionResult(<Promise<IExecutionResult>> context.client.remove.apply(context.client, args));
				}
			});
		}));
		this.registerCommand(CommandNames.Require, this.ensureComposerProject(context => {
			window.showInputBox({ prompt: Strings.ComposerRequireInput, placeHolder: Strings.ComposerRequirePlaceHolder }).then( options => {
				if (typeof(options) !== 'undefined' && options !== String.Empty ) {
					let args = options.split(String.Space);
					this.reportExecutionResult(<Promise<IExecutionResult>> context.client.require.apply(context.client, args));
				}
			});
		}));
		this.registerCommand(CommandNames.RunScript, this.ensureComposerProject(context => {
			window.showInputBox({ prompt: Strings.ComposerRunScriptInput, placeHolder: Strings.ComposerRunScriptPlaceHolder }).then( options => {
				if (typeof(options) !== 'undefined' && options !== String.Empty ) {
					let args = options.split(String.Space);
					this.reportExecutionResult(<Promise<IExecutionResult>> context.client.runScript.apply(context.client, args));
				}
			});
		}));
		this.registerCommand(CommandNames.SelfUpdate, context => {
			this.reportExecutionResult(context.client.selfUpdate());
		});
		this.registerCommand(CommandNames.Show, context => {
			window.showInputBox({ prompt: Strings.ComposerShowInput, placeHolder: Strings.ComposerShowPlaceHolder }).then( options => {
				if (typeof(options) !== 'undefined' ) {

					let args = ( options !== String.Empty )
							? options.split(String.Space)
							: [];

					this.reportExecutionResult(<Promise<IExecutionResult>> context.client.show.apply(context.client, args));
				}
			});
		});
		this.registerCommand(CommandNames.Status, this.ensureComposerProject(context => {
			context.client.status();
		}));
		this.registerCommand(CommandNames.Update, this.ensureComposerProject(context => {
			this.reportExecutionResult(context.client.update());
		}));
		this.registerCommand(CommandNames.Validate, this.ensureComposerProject(context => {
			this.reportExecutionResult(context.client.validate());
		}));
		this.registerCommand(CommandNames.Version, context => {
			this.reportExecutionResult(context.client.version());
		});
	}

	// Reinitialize the extension when coming back online
	public reinitialize(): void {
		this.dispose();
		this.initializeExtension();
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
					let selections: Map<QuickPickItem, ComposerContext> = new Map();
					for (let context of this.contexts.values()) {
						let quickPickItem: QuickPickItem = {
							label: context.folder.name,
							description: context.folder.uri.fsPath,
						};
						selections.set(quickPickItem, context);
					}
					window.showQuickPick(Array.from<QuickPickItem>(selections.keys())).then((selection: QuickPickItem) => {
						const context = selections.get(selection);
						if (context) {
							args.unshift(context);
							return callback.apply(this, args);
						}
					});
			}
		}
	}

	/**
	 * Safely execute a composer command handler.
	 * @param callback A composer command handler.
	 */
	private safeExecute(callback: ComposerCommandHandler): ComposerCommandHandler {
		return (context: ComposerContext, ...args: any[]) => {
			try {
				this.channel.show();
				args.unshift(context)
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
