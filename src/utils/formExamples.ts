/**
 * Form System - Usage Examples
 * 
 * This file contains practical examples of how to use the form system
 * in your VS Code extension.
 */

import * as vscode from 'vscode';
import { FormPanel, createForm, FormDefinition } from '../utils/formSystem';

/**
 * Example 1: Simple single-step form
 */
export function exampleSimpleForm(context: vscode.ExtensionContext) {
	const form = createForm('simple', 'Quick Survey')
		.addStep('main', 'Tell us about yourself')
		.addText('name', 'Name', { required: true })
		.addText('email', 'Email', { required: true })
		.addCheckbox('subscribe', 'Subscribe to updates')
		.build();

	FormPanel.createOrShow(context.extensionUri, form, (data) => {
		vscode.window.showInformationMessage(`Thanks ${data.name}!`);
	}, () => {
		vscode.window.showInformationMessage('Form cancelled');
	});
}

/**
 * Example 2: Multi-step wizard
 */
export function exampleWizard(context: vscode.ExtensionContext) {
	const wizard = createForm('wizard', 'Project Setup Wizard')
		.addStep('project', 'Project Details')
		.addText('projectName', 'Project Name', { 
			required: true,
			placeholder: 'my-awesome-project'
		})
		.addDropdown('projectType', 'Project Type', [
			'Web Application',
			'Mobile App',
			'Desktop App',
			'Library'
		], { required: true })
		.addStep('settings', 'Configuration')
		.addCheckbox('typescript', 'Use TypeScript', { defaultValue: true })
		.addCheckbox('testing', 'Include testing setup', { defaultValue: true })
		.addDropdown('packageManager', 'Package Manager', ['npm', 'yarn', 'pnpm'])
		.addStep('finish', 'Final Setup')
		.addLongText('notes', 'Additional Notes', { 
			rows: 6,
			placeholder: 'Any special requirements...'
		})
		.build();

	FormPanel.createOrShow(context.extensionUri, wizard, async (data) => {
		await vscode.window.showInformationMessage(
			`Creating ${data.projectName} (${data.projectType})...`
		);
		// Create project logic here
	});
}

/**
 * Example 3: Validation with custom patterns
 */
export function exampleValidation(context: vscode.ExtensionContext) {
	const form = createForm('validation', 'User Registration')
		.addStep('register', 'Create Account')
		.addText('username', 'Username', {
			required: true,
			validation: {
				pattern: '^[a-zA-Z0-9_]{3,20}$',
				message: '3-20 alphanumeric characters or underscore'
			}
		})
		.addText('email', 'Email', {
			required: true,
			validation: {
				pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
				message: 'Please enter a valid email address'
			}
		})
		.addText('website', 'Website', {
			validation: {
				pattern: '^https?://.+',
				message: 'Must start with http:// or https://'
			}
		})
		.build();

	FormPanel.createOrShow(context.extensionUri, form, (data) => {
		console.log('Valid registration:', data);
	});
}

/**
 * Example 4: Form with object syntax (alternative approach)
 */
export function exampleObjectSyntax(context: vscode.ExtensionContext) {
	const form: FormDefinition = {
		id: 'feedback',
		title: 'Feedback Form',
		description: 'Help us improve',
		steps: [
			{
				id: 'main',
				title: 'Your Feedback',
				fields: [
					{
						id: 'rating',
						label: 'Overall Rating',
						type: 'dropdown',
						options: ['Excellent', 'Good', 'Fair', 'Poor'],
						required: true
					},
					{
						id: 'comments',
						label: 'Comments',
						type: 'longtext',
						placeholder: 'Tell us more...',
						rows: 8,
						required: true
					},
					{
						id: 'followUp',
						label: 'May we contact you for follow-up?',
						type: 'checkbox'
					}
				]
			}
		],
		onSubmit: async (data) => {
			await vscode.window.showInformationMessage('Thank you for your feedback!');
		}
	};

	FormPanel.createOrShow(context.extensionUri, form);
}

/**
 * Example 5: Complex form with all field types
 */
export function exampleAllFieldTypes(context: vscode.ExtensionContext) {
	const form = createForm('complete', 'Complete Example')
		.description('Demonstrating all available field types')
		.addStep('text-fields', 'Text Inputs')
		.addText('shortText', 'Short Text', { 
			placeholder: 'Single line text',
			description: 'For short inputs like names, titles, etc.'
		})
		.addLongText('longText', 'Long Text', {
			placeholder: 'Multiple lines...',
			rows: 6,
			description: 'For longer inputs like descriptions, notes, etc.'
		})
		.addStep('selections', 'Selection Inputs')
		.addCheckbox('checkbox1', 'First Option', { defaultValue: true })
		.addCheckbox('checkbox2', 'Second Option')
		.addDropdown('simpleDropdown', 'Simple Dropdown', ['Option 1', 'Option 2', 'Option 3'])
		.addDropdown('labeledDropdown', 'Labeled Dropdown', [
			{ label: 'Display Name 1', value: 'value1' },
			{ label: 'Display Name 2', value: 'value2' },
			{ label: 'Display Name 3', value: 'value3' }
		])
		.addStep('required-fields', 'Required Fields')
		.stepDescription('These fields must be filled out')
		.addText('requiredText', 'Required Text', { required: true })
		.addDropdown('requiredDropdown', 'Required Dropdown', ['A', 'B', 'C'], { required: true })
		.addLongText('requiredLong', 'Required Long Text', { required: true, rows: 4 })
		.onSubmit((data) => {
			console.log('All field types submitted:', data);
		})
		.build();

	FormPanel.createOrShow(context.extensionUri, form);
}
