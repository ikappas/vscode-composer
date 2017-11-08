/*---------------------------------------------------------------------------------------------
 * Copyright (C) Ioannis Kappas. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

export interface IDisposable {
	dispose(): void;
}

export function dispose<T extends IDisposable>(...disposables: T[]): T;
export function dispose<T extends IDisposable>(disposables: T[]): T[];
export function dispose<T extends IDisposable>(...disposables: T[]): T[] {
	const first = disposables[0];

	if (Array.isArray(first)) {
		disposables = first as any as T[];
	}

	disposables.forEach(d => d && d.dispose());
	return [];
}

export function combinedDisposable(disposables: IDisposable[]): IDisposable;
export function combinedDisposable(...disposables: IDisposable[]): IDisposable;
export function combinedDisposable(disposables: any): IDisposable {
	return { dispose: () => dispose(disposables) };
}

export function toDisposable(...fns: (() => void)[]): IDisposable {
	return combinedDisposable(fns.map(fn => ({ dispose: fn })));
}
