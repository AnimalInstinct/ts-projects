export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
