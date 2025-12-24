import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FormDefinition, FormData, FormMessage } from '../utils/formTypes';
import { FormRenderer } from '../utils/formRenderer';

/**
 * Panel for displaying and managing forms in a webview
 */
export class FormPanel {
	public static currentPanel: FormPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	private _formDefinition: FormDefinition;
	private _onSubmitCallback?: (data: FormData) => void | Promise<void>;
	private _onCancelCallback?: () => void | Promise<void>;
	private _isSubmitted: boolean = false;

	/**
	 * Create or show the form panel
	 */
	public static createOrShow(
		extensionUri: vscode.Uri,
		formDefinition: FormDefinition,
		onSubmit?: (data: FormData) => void | Promise<void>,
		onCancel?: () => void | Promise<void>
	) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it
		if (FormPanel.currentPanel) {
			FormPanel.currentPanel._panel.reveal(column);
			FormPanel.currentPanel.updateForm(formDefinition, onSubmit, onCancel);
			return;
		}

		// Otherwise, create a new panel
		const panel = vscode.window.createWebviewPanel(
			'formPanel',
			formDefinition.title,
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [
					vscode.Uri.joinPath(extensionUri, 'html', 'Form')
				]
			}
		);

		FormPanel.currentPanel = new FormPanel(panel, extensionUri, formDefinition, onSubmit, onCancel);
	}

	private constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		formDefinition: FormDefinition,
		onSubmit?: (data: FormData) => void | Promise<void>,
		onCancel?: () => void | Promise<void>
	) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._formDefinition = formDefinition;
		this._onSubmitCallback = onSubmit;
		this._onCancelCallback = onCancel;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			async (message: FormMessage) => {
				switch (message.type) {
					case 'formSubmit':
						await this._handleFormSubmit(message.data);
						break;
					case 'formCancel':
						await this._handleFormCancel();
						break;
					case 'stepChanged':
						// Could be used for analytics or validation
						break;
					case 'ready':
						// Webview is ready, could trigger any initialization
						break;
				}
			},
			null,
			this._disposables
		);
	}

	/**
	 * Update the form definition and re-render
	 */
	public updateForm(formDefinition: FormDefinition, onSubmit?: (data: FormData) => void | Promise<void>, onCancel?: () => void | Promise<void>) {
		this._formDefinition = formDefinition;
		this._onSubmitCallback = onSubmit;
		this._onCancelCallback = onCancel;
		this._panel.title = formDefinition.title;
		this._update();
	}

	/**
	 * Handle form submission
	 */
	private async _handleFormSubmit(data: FormData) {
		try {
			// Mark as submitted to prevent cancel callback
			this._isSubmitted = true;

			// Call the callback if provided
			if (this._onSubmitCallback) {
				await this._onSubmitCallback(data);
			}

			// Call the form's onSubmit if provided
			if (this._formDefinition.onSubmit) {
				await this._formDefinition.onSubmit(data);
			}

			// Show success message
			vscode.window.showInformationMessage('Form submitted successfully!');

			// Close the panel
			this._panel.dispose();
		} catch (error) {
			vscode.window.showErrorMessage(`Form submission failed: ${error}`);
		}
	}

	/**
	 * Handle form cancellation
	 */
	private async _handleFormCancel() {
		this._isSubmitted = true; // Prevent double-calling cancel
		if (this._onCancelCallback) {
			await this._onCancelCallback();
		}
		this._panel.dispose();
	}

	/**
	 * Clean up resources
	 */
	public dispose() {
		// If not submitted and panel is closing, trigger cancel callback
		if (!this._isSubmitted && this._onCancelCallback) {
			Promise.resolve(this._onCancelCallback()).catch(err => {
				console.error('Error in cancel callback:', err);
			});
		}

		FormPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}

	/**
	 * Update the webview content
	 */
	private _update() {
		const webview = this._panel.webview;
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	/**
	 * Generate HTML content for the webview
	 */
	private _getHtmlForWebview(webview: vscode.Webview): string {
		// Load the HTML template
		const htmlPath = vscode.Uri.joinPath(
			this._extensionUri,
			'html',
			'Form',
			'index.html'
		);

		let html = fs.readFileSync(htmlPath.fsPath, 'utf8');

		// Generate nonce for CSP
		const nonce = this._getNonce();

		// Replace nonce placeholder
		html = html.replace(/{{nonce}}/g, nonce);

		// Render the form and inject it into the HTML
		const formHtml = FormRenderer.renderForm(this._formDefinition);
		html = html.replace(
			'<div id="app">',
			`<div id="app">${formHtml}`
		);

		return html;
	}

	/**
	 * Generate a random nonce for CSP
	 */
	private _getNonce(): string {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}
}
