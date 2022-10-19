import { autobind } from '../decorators/autobind.js'
import { Project, ProjectStatus } from '../models/project.js'
import { state } from '../state/state.js'
import * as Validation from '../utils/validation.js'
import Component from './component.js'

type GatherUserInputResponse = {
    success: boolean,
    msg?: string,
    data?: {
        title: string,
        description: string,
        numOfPeople: number
    }
}

export class ProjectForm extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        super('project-form', 'app', 'afterbegin', 'user-input')

        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title')
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description')
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people')

        this.configure()
    }


    private gatherUserInput(): GatherUserInputResponse {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = +this.peopleInputElement.value

        const titleValidatable: Validation.Validatable = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatable: Validation.Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validation.Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (
            !Validation.validate(titleValidatable) ||
            !Validation.validate(descriptionValidatable) ||
            !Validation.validate(peopleValidatable)
        ) {
            console.log("Validation error")
            return { success: false, msg: "Validation error" }
        } else {

            return { success: true, data: { title: enteredTitle, description: enteredDescription, numOfPeople: enteredPeople } }
        }
    }

    @autobind
    private submitHandler(e: Event) {
        e.preventDefault()
        const userInputs = this.gatherUserInput()

        if (userInputs.success && userInputs.data) {
            const { title, description, numOfPeople } = userInputs.data
            const project = new Project(title, description, numOfPeople, ProjectStatus.Active)
            state.addProject(project)
            this.clearInputs()
        }
    }

    private clearInputs() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }
}
