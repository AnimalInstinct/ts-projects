import { autobind } from '../decorators/autobind.js'
import { DragTarget } from '../models/dragDrop.js'
import { Project, ProjectStatus } from '../models/project.js'
import { state } from '../state/state.js'
import { Component } from './component.js'
import { ProjectItem } from './projectItem.js'

export class ProjectsList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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

        this.element.addEventListener('dragover', this.dragOverHandler)
        this.element.addEventListener('drop', this.dropHandler)
        this.element.addEventListener('dragleave', this.dragLeaveHandler)
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault()
            const listEl = this.element.querySelector('ul')
            listEl?.classList.add('droppable')
        }
    }

    @autobind
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer?.getData('text/plain')
        const newStatus = this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
        projectId && state.moveProject(projectId, newStatus)
    }

    @autobind
    dragLeaveHandler(_event: DragEvent): void {
        const listEl = this.element.querySelector('ul')
        listEl?.classList.remove('droppable')
    }

}
