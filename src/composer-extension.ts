/*---------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { Disposable, OutputChannel, window, workspace, commands } from 'vscode';
import { IExecutionResult } from './helpers/execution';
import { Settings } from './helpers/settings';
import { CommandNames } from './helpers/constants';
import { Strings } from './helpers/strings';
import { Constants } from './helpers/constants';
import { ComposerContext } from './contexts/composer-context';
import { ComposerClient } from './clients/composer-client';
// import * as strings from './base/common/strings';

export class ComposerExtension extends Disposable {
	private disposables: Disposable[] = [];
    private settings: Settings;
	private context: ComposerContext;
	private client: ComposerClient;
	private channel: OutputChannel;

	constructor() {
		super(() => {
			this.disposables.map((d)=>{d.dispose();});
		});

        this.initializeExtension();

        // Add the event listener for settings changes, then re-initialized the extension
        workspace.onDidChangeConfiguration(() => {
            this.reinitialize();
        });
    }

	private initializeExtension(): void {
		this.context = new ComposerContext(workspace.rootPath);
		this.settings = new Settings();

		if ( this.settings.enabled ) {
			this.client = new ComposerClient({
				executablePath: this.settings.executablePath,
				env: process.env
			});

			this.channel = window.createOutputChannel(Constants.OutputChannel);
			this.disposables.push( this.channel );

			this.client.onOutput(output => {
				this.channel.append(output);
			});
		}

		// Register commands.
		this.registerCommand(CommandNames.About, () => {
			this.reportExecutionResult(this.client.about());
		});
		this.registerCommand(CommandNames.Archive, () => {
			window.showInputBox({ prompt: Strings.ComposerArchiveInput, placeHolder: Strings.ComposerArchivePlaceHolder }).then( pkg => {
				if (typeof(pkg) !== 'undefined') {

					let args = ( pkg !== String.Empty )
							 ? pkg.split(String.Space)
							 : [];

					this.reportExecutionResult(<Promise<IExecutionResult>> this.client.archive.apply(this.client, args));
				}
			});
		});
		this.registerCommand(CommandNames.ClearCache, () => {
			this.reportExecutionResult(this.client.clearCache());
		});
		this.registerCommand(CommandNames.Diagnose, () => {
			this.reportExecutionResult(this.client.diagnose());
		});
		this.registerCommand(CommandNames.DumpAutoload, () => {
			window.showInputBox({ prompt: Strings.ComposerDumpAutoloadInput, placeHolder: Strings.ComposerDumpAutoloadPlaceHolder }).then( options => {
				if (typeof(options) !== 'undefined') {

					let args = ( options !== String.Empty )
							 ? options.split(String.Space)
							 : [];

					this.reportExecutionResult(<Promise<IExecutionResult>> this.client.dumpAutoload.apply(this.client, args));
				}
			});
		});
		this.registerCommand(CommandNames.Install, this.ensureComposerProject(() => {
			this.reportExecutionResult(this.client.install());
		}));
		this.registerCommand(CommandNames.Remove, this.ensureComposerProject(() => {
			window.showInputBox({ prompt: Strings.ComposerRemoveInput, placeHolder: Strings.ComposerRemovePlaceHolder }).then( options => {
				if (typeof(options) !== 'undefined' && options !== String.Empty ) {
					let args = options.split(String.Space);
					this.reportExecutionResult(<Promise<IExecutionResult>> this.client.remove.apply(this.client, args));
				}
			});
		}));
		this.registerCommand(CommandNames.Require, this.ensureComposerProject(() => {
			window.showInputBox({ prompt: Strings.ComposerRequireInput, placeHolder: Strings.ComposerRequirePlaceHolder }).then( options => {
				if (typeof(options) !== 'undefined' && options !== String.Empty ) {
					let args = options.split(String.Space);
					this.reportExecutionResult(<Promise<IExecutionResult>> this.client.require.apply(this.client, args));
				}
			});
		}));
		this.registerCommand(CommandNames.RunScript, this.ensureComposerProject(() => {
			window.showInputBox({ prompt: Strings.ComposerRunScriptInput, placeHolder: Strings.ComposerRunScriptPlaceHolder }).then( options => {
				if (typeof(options) !== 'undefined' && options !== String.Empty ) {
					let args = options.split(String.Space);
					this.reportExecutionResult(<Promise<IExecutionResult>> this.client.runScript.apply(this.client, args));
				}
			});
		}));
		this.registerCommand(CommandNames.SelfUpdate, () => {
			this.reportExecutionResult(this.client.selfUpdate());
		});
		this.registerCommand(CommandNames.Show, () => {
			window.showInputBox({ prompt: Strings.ComposerShowInput, placeHolder: Strings.ComposerShowPlaceHolder }).then( options => {
				if (typeof(options) !== 'undefined' ) {

					let args = ( options !== String.Empty )
							 ? options.split(String.Space)
							 : [];

					this.reportExecutionResult(<Promise<IExecutionResult>> this.client.show.apply(this.client, args));
				}
			});
		});
		this.registerCommand(CommandNames.Status, this.ensureComposerProject(() => {
			this.client.status();
		}));
		this.registerCommand(CommandNames.Update, this.ensureComposerProject(() => {
			this.reportExecutionResult(this.client.update());
		}));
		this.registerCommand(CommandNames.Validate, this.ensureComposerProject(() => {
			this.reportExecutionResult(this.client.validate());
		}));
		this.registerCommand(CommandNames.Version, () => {
			this.reportExecutionResult(this.client.version());
		});
	}

	// Reinitialize the extension when coming back online
    public reinitialize(): void {
        this.dispose();
        this.initializeExtension();
	}

	private safeExecute(func: (...args: any[]) => any) : (...args: any[]) => any {
		return (...args: any[]) => {
			if (this.settings && this.settings.enabled) {
				try {
					this.channel.show();
					return func.apply(this, args);
				} catch (error) {
					window.showErrorMessage(error.message);
				}
			}
		};
	}

	private ensureComposerProject(func: (...args: any[]) => any): (...args: any[]) => any {
		return (...args: any[]) => {
			if (this.context.isComposerProject()) {
				return func.apply(this, args);
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
	private registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): void {
		this.disposables.push(commands.registerCommand(command, this.safeExecute( callback ), thisArg));
	}
}
