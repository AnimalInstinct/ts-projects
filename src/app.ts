/// <reference path="models/dragDrop.ts" />
/// <reference path="models/project.ts" />
/// <reference path="state/state.ts" />
/// <reference path="utils/validation.ts" />
/// <reference path="decorators/autobind.ts" />
/// <reference path="components/component.ts" />
/// <reference path="components/projectItem.ts" />
/// <reference path="components/projectsList.ts" />
/// <reference path="components/projectForm.ts" />

namespace App {
    new ProjectForm()
    new ProjectsList('active')
    new ProjectsList('finished')
}
