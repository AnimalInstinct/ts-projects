// Drag and drop interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void
    dragEndHandler(event: DragEvent): void
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void
    dropHandler(event: DragEvent): void
    dragLeaveHandler(event: DragEvent): void
}

// Simple State management
type RootState = { projects: Project[] }

enum ProjectStatus { Active, Finished }

class Project {
    public id: string
    constructor(
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {
        this.id = Math.random().toString()
    }
}

type Listener<T> = (items: T[]) => void

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(fn: Listener<T>) {
        this.listeners.push(fn)
    }
}

class ProjectsState extends State<Project> {
    private _state: RootState = { projects: [] };
    private static _instance: ProjectsState

    private constructor() {
        super()
    }

    static init() {
        if (this._instance) {
            return this._instance
        }
        this._instance = new ProjectsState()
        return this._instance
    }

    get state() {
        return this._state
    }

    addProject(project: Project) {
        const stateUpdated = <RootState>Object.assign(this._state)
        stateUpdated.projects.push(project)
        this._state = stateUpdated
        this.updateListeners()
    }

    moveProject(projectId: string, status: ProjectStatus) {
        const projectFound = this._state.projects.find(prj => prj.id === projectId)

        if (projectFound && projectFound.status !== status) {
            projectFound.status = status
            this.updateListeners()
        }
    }

    updateListeners() {
        this.listeners.forEach(fn => {
            fn(this._state.projects.slice())
        })
    }
}

const state = ProjectsState.init()

// Validation
interface Validatable {
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
}

function validate(validatableInput: Validatable) {
    let isValid = true
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }
    if (
        validatableInput.minLength != null &&
        typeof validatableInput.value === 'string'
    ) {
        isValid =
            isValid && validatableInput.value.length >= validatableInput.minLength
    }
    if (
        validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string'
    ) {
        isValid =
            isValid && validatableInput.value.length <= validatableInput.maxLength
    }
    if (
        validatableInput.min != null &&
        typeof validatableInput.value === 'number'
    ) {
        isValid = isValid && validatableInput.value >= validatableInput.min
    }
    if (
        validatableInput.max != null &&
        typeof validatableInput.value === 'number'
    ) {
        isValid = isValid && validatableInput.value <= validatableInput.max
    }

    return isValid
}

// Autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this)
            return boundFn
        }
    }

    return adjDescriptor
}

// Component
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement
    hostElement: T
    element: U

    constructor(
        public templateId: string,
        public hostElementId: string,
        public position: InsertPosition,
        public elementId?: string
    ) {
        this.templateElement = document.getElementById(templateId) as HTMLTemplateElement
        this.hostElement = document.getElementById(hostElementId) as T

        const importedNode = document.importNode(
            this.templateElement.content,
            true
        )
        this.element = <U>importedNode.firstElementChild

        if (elementId) {
            this.element.id = elementId
        }

        this.render()
    }

    render() {
        this.element && this.hostElement.insertAdjacentElement(this.position, this.element)
    }
}

// Project Item class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    get persons() {
        return this.project.people === 1 ? ' person ' : ' persons '
    }

    constructor(public project: Project, public hostElementId: string) {
        super('single-project', hostElementId, 'beforeend', project.id)
        this.configure()
        this.renderContent()
    }

    renderContent() {
        const titleEl = document.createElement('h2')
        const statusEl = document.createElement('p')
        const personsEl = document.createElement('p')
        titleEl.innerText = this.project.title
        statusEl.innerText = this.project.description
        personsEl.innerText = this.project.people + this.persons + 'involved.'
        this.element.append(titleEl)
        this.element.append(statusEl)
        this.element.append(personsEl)
    }

    @autobind
    dragStartHandler(event: DragEvent): void {
        if (event.dataTransfer) {
            // console.log('Set data::', this.project.id)
            event.dataTransfer.setData('text/plain', this.project.id)
            event.dataTransfer.effectAllowed = 'move'
            console.log('Data set::', event)
        }
    }

    @autobind
    dragEndHandler(_event: DragEvent): void {
        // console.log(event)
    }

    configure() {
        this.element.draggable = true
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragEndHandler)
    }
}

// ProjectList Class
class ProjectsList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[] = [];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', 'beforeend', `${type}-projects`)



        this.configure()
        this.renderContent()
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement
        listEl.innerHTML = ""
        this.assignedProjects.forEach(project => {
            new ProjectItem(project, `${this.type}-projects-list`)
        })
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent =
            this.type.toUpperCase() + ' PROJECTS'
    }

    configure() {
        function stateChanged(this: ProjectsList, projects: Project[]) {
            console.log(`ProjectsList ${this.type}::Listener::State changed::`, projects)
            const relevantProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active
                }
                return prj.status === ProjectStatus.Finished
            })
            this.assignedProjects = relevantProjects
            this.renderProjects()
        }

        state.addListener(stateChanged.bind(this))

        console.log(`Configure ${this.type}`)


        this.element.addEventListener('dragover', this.dragOverHandler)
        this.element.addEventListener('drop', this.dropHandler)
        this.element.addEventListener('dragleave', this.dragLeaveHandler)
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault()
            // console.log('DRAG OVER', event.dataTransfer)

            const listEl = this.element.querySelector('ul')
            listEl?.classList.add('droppable')
        }

        // console.log(`Drag over ${this.type}`, event)
    }

    @autobind
    dropHandler(event: DragEvent): void {
        console.log("DROPPED")
        const projectId = event.dataTransfer?.getData('text/plain')
        const newStatus = this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
        projectId && state.moveProject(projectId, newStatus)
    }

    @autobind
    dragLeaveHandler(_event: DragEvent): void {

        const listEl = this.element.querySelector('ul')
        listEl?.classList.remove('droppable')

        console.log("LEAVED")

    }

}

type GatherUserInputResponse = {
    success: boolean,
    msg?: string,
    data?: {
        title: string,
        description: string,
        numOfPeople: number
    }
}

// Project form component
class ProjectForm extends Component<HTMLDivElement, HTMLFormElement> {
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

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
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

new ProjectForm()
new ProjectsList('active')
new ProjectsList('finished')

const proj1: Project = new Project(
    "Test",
    "Decription",
    3,
    ProjectStatus.Active
)

const proj2: Project = new Project(
    "Test2",
    "Decription2",
    1,
    ProjectStatus.Active
)

state.addProject(proj1)
state.addProject(proj2)