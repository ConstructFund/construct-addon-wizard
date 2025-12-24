import {
	FormDefinition,
	FormStep,
	FormField,
	CheckboxField,
	DropdownField,
	TextField,
	LongTextField
} from './formTypes';

/**
 * Builder class for creating forms programmatically
 */
export class FormBuilder {
	private form: Partial<FormDefinition>;
	private currentStep: Partial<FormStep> | null = null;

	constructor(id: string, title: string) {
		this.form = {
			id,
			title,
			steps: []
		};
	}

	/**
	 * Set form description
	 */
	description(description: string): this {
		this.form.description = description;
		return this;
	}

	/**
	 * Add a new step to the form
	 */
	addStep(id: string, title: string): this {
		if (this.currentStep) {
			this.form.steps!.push(this.currentStep as FormStep);
		}

		this.currentStep = {
			id,
			title,
			fields: []
		};

		return this;
	}

	/**
	 * Set description for current step
	 */
	stepDescription(description: string): this {
		if (!this.currentStep) {
			throw new Error('No step to add description to. Call addStep() first.');
		}
		this.currentStep.description = description;
		return this;
	}

	/**
	 * Add a checkbox field to current step
	 */
	addCheckbox(id: string, label: string, options?: {
		required?: boolean;
		defaultValue?: boolean;
		description?: string;
	}): this {
		const field: CheckboxField = {
			id,
			label,
			type: 'checkbox',
			...options
		};
		this._addField(field);
		return this;
	}

	/**
	 * Add a dropdown field to current step
	 */
	addDropdown(id: string, label: string, optionsList: string[] | { label: string; value: string }[], options?: {
		required?: boolean;
		defaultValue?: string;
		description?: string;
	}): this {
		const field: DropdownField = {
			id,
			label,
			type: 'dropdown',
			options: optionsList,
			...options
		};
		this._addField(field);
		return this;
	}

	/**
	 * Add a text field to current step
	 */
	addText(id: string, label: string, options?: {
		required?: boolean;
		defaultValue?: string;
		description?: string;
		placeholder?: string;
		validation?: {
			pattern?: string;
			message?: string;
		};
	}): this {
		const field: TextField = {
			id,
			label,
			type: 'text',
			...options
		};
		this._addField(field);
		return this;
	}

	/**
	 * Add a long text (textarea) field to current step
	 */
	addLongText(id: string, label: string, options?: {
		required?: boolean;
		defaultValue?: string;
		description?: string;
		placeholder?: string;
		rows?: number;
	}): this {
		const field: LongTextField = {
			id,
			label,
			type: 'longtext',
			...options
		};
		this._addField(field);
		return this;
	}

	/**
	 * Set the onSubmit callback
	 */
	onSubmit(callback: (data: Record<string, any>) => void | Promise<void>): this {
		this.form.onSubmit = callback;
		return this;
	}

	/**
	 * Build and return the form definition
	 */
	build(): FormDefinition {
		// Add the last step if exists
		if (this.currentStep) {
			this.form.steps!.push(this.currentStep as FormStep);
			this.currentStep = null;
		}

		// Validate
		if (!this.form.steps || this.form.steps.length === 0) {
			throw new Error('Form must have at least one step');
		}

		return this.form as FormDefinition;
	}

	/**
	 * Helper to add field to current step
	 */
	private _addField(field: FormField): void {
		if (!this.currentStep) {
			throw new Error('No step to add field to. Call addStep() first.');
		}
		this.currentStep.fields!.push(field);
	}
}

/**
 * Create a new form builder
 */
export function createForm(id: string, title: string): FormBuilder {
	return new FormBuilder(id, title);
}
