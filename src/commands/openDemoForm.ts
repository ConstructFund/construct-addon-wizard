import * as vscode from 'vscode';
import { FormPanel, FormDefinition, createForm } from '../utils/formSystem';

/**
 * Command to open a demo form
 */
export async function openDemoForm(context?: vscode.ExtensionContext) {
	if (!context) {
		vscode.window.showErrorMessage('Extension context not available');
		return;
	}
	// Option 1: Using FormBuilder (recommended for cleaner code)
	const demoFormBuilder = createForm('builderDemo', 'Demo Form (Builder)')
		.description('This form was created using the FormBuilder API')
		.addStep('step1', 'Basic Information')
		.stepDescription('Please provide your basic information')
		.addText('name', 'Name', {
			required: true,
			placeholder: 'Enter your name',
			description: 'Your full name'
		})
		.addText('email', 'Email', {
			required: true,
			placeholder: 'email@example.com',
			validation: {
				pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
				message: 'Please enter a valid email address'
			}
		})
		.addDropdown('role', 'Role', [
			{ label: 'Developer', value: 'dev' },
			{ label: 'Designer', value: 'designer' },
			{ label: 'Manager', value: 'manager' },
			{ label: 'Other', value: 'other' }
		], {
			required: true,
			description: 'Select your primary role'
		})
		.addStep('step2', 'Preferences')
		.stepDescription('Tell us about your preferences')
		.addCheckbox('newsletter', 'Subscribe to newsletter', {
			defaultValue: true,
			description: 'Receive updates and news via email'
		})
		.addCheckbox('notifications', 'Enable notifications', {
			defaultValue: false,
			description: 'Get notified about important events'
		})
		.addDropdown('theme', 'Preferred Theme', ['Light', 'Dark', 'High Contrast', 'Auto'], {
			defaultValue: 'Auto'
		})
		.addStep('step3', 'Additional Information')
		.stepDescription('Provide any additional details')
		.addLongText('bio', 'Biography', {
			placeholder: 'Tell us about yourself...',
			rows: 8,
			description: 'A brief description about yourself (optional)'
		})
		.addLongText('feedback', 'Feedback', {
			required: true,
			placeholder: 'Your feedback...',
			rows: 5,
			description: 'Please provide your feedback about this form system'
		})
		.build();

	// Option 2: Using plain object (more verbose but works too)
	const demoForm: FormDefinition = {
		id: 'demoForm',
		title: 'Demo Form (Object)',
		description: 'This is a demonstration of the form system with multiple steps and various field types.',
		steps: [
			{
				id: 'step1',
				title: 'Basic Information',
				description: 'Please provide your basic information',
				fields: [
					{
						id: 'name',
						label: 'Name',
						type: 'text',
						required: true,
						placeholder: 'Enter your name',
						description: 'Your full name'
					},
					{
						id: 'email',
						label: 'Email',
						type: 'text',
						required: true,
						placeholder: 'email@example.com',
						validation: {
							pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
							message: 'Please enter a valid email address'
						}
					},
					{
						id: 'role',
						label: 'Role',
						type: 'dropdown',
						required: true,
						options: [
							{ label: 'Developer', value: 'dev' },
							{ label: 'Designer', value: 'designer' },
							{ label: 'Manager', value: 'manager' },
							{ label: 'Other', value: 'other' }
						],
						description: 'Select your primary role'
					}
				]
			},
			{
				id: 'step2',
				title: 'Preferences',
				description: 'Tell us about your preferences',
				fields: [
					{
						id: 'newsletter',
						label: 'Subscribe to newsletter',
						type: 'checkbox',
						defaultValue: true,
						description: 'Receive updates and news via email'
					},
					{
						id: 'notifications',
						label: 'Enable notifications',
						type: 'checkbox',
						defaultValue: false,
						description: 'Get notified about important events'
					},
					{
						id: 'theme',
						label: 'Preferred Theme',
						type: 'dropdown',
						options: ['Light', 'Dark', 'High Contrast', 'Auto'],
						defaultValue: 'Auto'
					}
				]
			},
			{
				id: 'step3',
				title: 'Additional Information',
				description: 'Provide any additional details',
				fields: [
					{
						id: 'bio',
						label: 'Biography',
						type: 'longtext',
						placeholder: 'Tell us about yourself...',
						rows: 8,
						description: 'A brief description about yourself (optional)'
					},
					{
						id: 'feedback',
						label: 'Feedback',
						type: 'longtext',
						required: true,
						placeholder: 'Your feedback...',
						rows: 5,
						description: 'Please provide your feedback about this form system'
					}
				]
			}
		]
	};

	// Ask user which approach to demo
	const choice = await vscode.window.showQuickPick(
		['FormBuilder API', 'Plain Object'],
		{ placeHolder: 'Choose form creation method to demo' }
	);

	const selectedForm = choice === 'FormBuilder API' ? demoFormBuilder : demoForm;

	// Open the form panel
	FormPanel.createOrShow(
		context.extensionUri,
		selectedForm,
		async (data) => {
			// Handle form submission
			const message = Object.entries(data)
				.map(([key, value]) => `${key}: ${value}`)
				.join('\n');

			const action = await vscode.window.showInformationMessage(
				'Form submitted! View data?',
				'Yes',
				'No'
			);

			if (action === 'Yes') {
				// Create a new document with the form data
				const doc = await vscode.workspace.openTextDocument({
					content: JSON.stringify(data, null, 2),
					language: 'json'
				});
				await vscode.window.showTextDocument(doc);
			}
		},
		async () => {
			// Handle form cancellation
			vscode.window.showInformationMessage('Form was cancelled');
		}
	);
}
