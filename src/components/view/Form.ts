import { Component } from "../base/Component";

export interface FormViewState {
  valid?: boolean;
  errors?: string;
}

export class Form<
  TState extends FormViewState = FormViewState
> extends Component<TState> {
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);

    const submitButton = this.container.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    );
    const errorsElement =
      this.container.querySelector<HTMLElement>(".form__errors");

    if (!submitButton || !errorsElement) {
      throw new Error("Form: не найдены submit кнопка или .form__errors");
    }

    this.submitButton = submitButton;
    this.errorsElement = errorsElement;
  }

  set valid(value: boolean | undefined) {
    this.submitButton.disabled = !value;
  }

  set errors(message: string | undefined) {
    this.errorsElement.textContent = message ?? "";
  }
}
