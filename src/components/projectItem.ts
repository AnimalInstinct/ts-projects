import { autobind } from '../decorators/autobind.js'
import { Draggable } from '../models/dragDrop.js'
import { Project } from '../models/project.js'
import { Component } from './component.js'

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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
            event.dataTransfer.setData('text/plain', this.project.id)
            event.dataTransfer.effectAllowed = 'move'
        }
    }

    @autobind
    dragEndHandler(_event: DragEvent): void {
    }

    configure() {
        this.element.draggable = true
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragEndHandler)
    }
}
