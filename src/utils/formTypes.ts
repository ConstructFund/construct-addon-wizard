/**
 * Form field types supported by the form system
 */
export type FormFieldType = 'checkbox' | 'dropdown' | 'text' | 'longtext';

/**
 * Base form field interface
 */
export interface FormFieldBase {
	id: string;
	label: string;
	type: FormFieldType;
	required?: boolean;
	defaultValue?: any;
	description?: string;
	placeholder?: string;
}

/**
 * Checkbox field
 */
export interface CheckboxField extends FormFieldBase {
	type: 'checkbox';
	defaultValue?: boolean;
}

/**
 * Dropdown field
 */
export interface DropdownField extends FormFieldBase {
	type: 'dropdown';
	options: string[] | { label: string; value: string }[];
	defaultValue?: string;
}

/**
 * Text input field
 */
export interface TextField extends FormFieldBase {
	type: 'text';
	defaultValue?: string;
	validation?: {
		pattern?: string;
		message?: string;
	};
}

/**
 * Long text (textarea) field
 */
export interface LongTextField extends FormFieldBase {
	type: 'longtext';
	defaultValue?: string;
	rows?: number;
}

/**
 * Union type of all form fields
 */
export type FormField = CheckboxField | DropdownField | TextField | LongTextField;

/**
 * Form step definition
 */
export interface FormStep {
	id: string;
	title: string;
	description?: string;
	fields: FormField[];
}

/**
 * Complete form definition
 */
export interface FormDefinition {
	id: string;
	title: string;
	description?: string;
	steps: FormStep[];
	onSubmit?: (data: Record<string, any>) => void | Promise<void>;
}

/**
 * Form data collected from user input
 */
export interface FormData {
	[fieldId: string]: any;
}

/**
 * Message types for communication between webview and extension
 */
export type FormMessage =
	| { type: 'formSubmit'; data: FormData }
	| { type: 'formCancel' }
	| { type: 'stepChanged'; step: number }
	| { type: 'ready' };
