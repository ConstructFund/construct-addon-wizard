import { FormDefinition, FormField, FormStep } from './formTypes';

/**
 * Renders a form definition to HTML
 */
export class FormRenderer {
	/**
	 * Generate complete HTML for a form
	 */
	static renderForm(form: FormDefinition): string {
		const stepsHtml = form.steps
			.map((step, index) => this.renderStep(step, index, form.steps.length))
			.join('');

		return `
			<div class="form-container" data-form-id="${form.id}">
				<div class="form-header">
					<h1>${this.escapeHtml(form.title)}</h1>
					${form.description ? `<p class="form-description">${this.escapeHtml(form.description)}</p>` : ''}
				</div>
				
				<div class="form-steps">
					${stepsHtml}
				</div>
				
				<div class="form-navigation">
					<button id="prevBtn" class="button secondary" disabled>Previous</button>
					<div class="step-indicator">
						<span id="currentStep">1</span> / <span id="totalSteps">${form.steps.length}</span>
					</div>
					<button id="nextBtn" class="button primary">Next</button>
					<button id="submitBtn" class="button primary" style="display: none;">Submit</button>
				</div>
			</div>
		`;
	}

	/**
	 * Render a single form step
	 */
	private static renderStep(step: FormStep, index: number, totalSteps: number): string {
		const fieldsHtml = step.fields.map(field => this.renderField(field)).join('');
		const isActive = index === 0;

		return `
			<div class="form-step ${isActive ? 'active' : ''}" data-step="${index}">
				<div class="step-header">
					<h2>${this.escapeHtml(step.title)}</h2>
					${step.description ? `<p class="step-description">${this.escapeHtml(step.description)}</p>` : ''}
				</div>
				<div class="step-fields">
					${fieldsHtml}
				</div>
			</div>
		`;
	}

	/**
	 * Render a single form field
	 */
	private static renderField(field: FormField): string {
		const required = field.required ? 'required' : '';
		const requiredMark = field.required ? '<span class="required-mark">*</span>' : '';

		switch (field.type) {
			case 'checkbox':
				return `
					<div class="form-field" data-field-id="${field.id}">
						<label class="checkbox-label">
							<input 
								type="checkbox" 
								id="${field.id}" 
								name="${field.id}"
								${field.defaultValue ? 'checked' : ''}
								${required}
							/>
							<span>${this.escapeHtml(field.label)}${requiredMark}</span>
						</label>
						${field.description ? `<p class="field-description">${this.escapeHtml(field.description)}</p>` : ''}
					</div>
				`;

			case 'dropdown':
				const options = field.options.map(opt => {
					if (typeof opt === 'string') {
						const selected = field.defaultValue === opt ? 'selected' : '';
						return `<option value="${this.escapeHtml(opt)}" ${selected}>${this.escapeHtml(opt)}</option>`;
					} else {
						const selected = field.defaultValue === opt.value ? 'selected' : '';
						return `<option value="${this.escapeHtml(opt.value)}" ${selected}>${this.escapeHtml(opt.label)}</option>`;
					}
				}).join('');

				return `
					<div class="form-field" data-field-id="${field.id}">
						<label for="${field.id}">
							${this.escapeHtml(field.label)}${requiredMark}
						</label>
						${field.description ? `<p class="field-description">${this.escapeHtml(field.description)}</p>` : ''}
						<select 
							id="${field.id}" 
							name="${field.id}"
							${required}
						>
							<option value="">Select an option</option>
							${options}
						</select>
					</div>
				`;

			case 'text':
				return `
					<div class="form-field" data-field-id="${field.id}">
						<label for="${field.id}">
							${this.escapeHtml(field.label)}${requiredMark}
						</label>
						${field.description ? `<p class="field-description">${this.escapeHtml(field.description)}</p>` : ''}
						<input 
							type="text" 
							id="${field.id}" 
							name="${field.id}"
							${field.placeholder ? `placeholder="${this.escapeHtml(field.placeholder)}"` : ''}
							${field.defaultValue ? `value="${this.escapeHtml(field.defaultValue)}"` : ''}
							${field.validation?.pattern ? `pattern="${this.escapeHtml(field.validation.pattern)}"` : ''}
							${required}
						/>
						${field.validation?.message ? `<p class="field-validation-message">${this.escapeHtml(field.validation.message)}</p>` : ''}
					</div>
				`;

			case 'longtext':
				return `
					<div class="form-field" data-field-id="${field.id}">
						<label for="${field.id}">
							${this.escapeHtml(field.label)}${requiredMark}
						</label>
						${field.description ? `<p class="field-description">${this.escapeHtml(field.description)}</p>` : ''}
						<textarea 
							id="${field.id}" 
							name="${field.id}"
							rows="${field.rows || 5}"
							${field.placeholder ? `placeholder="${this.escapeHtml(field.placeholder)}"` : ''}
							${required}
						>${field.defaultValue ? this.escapeHtml(field.defaultValue) : ''}</textarea>
					</div>
				`;

			default:
				return '';
		}
	}

	/**
	 * Escape HTML to prevent XSS
	 */
	private static escapeHtml(text: string): string {
		const div = { textContent: text } as any;
		const textNode = { data: text } as any;
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}
}
