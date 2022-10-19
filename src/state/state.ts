import { Project, ProjectStatus } from '../models/project'

type RootState = { projects: Project[] }

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

export const state = ProjectsState.init()
