import { StudioProject } from './types';

export class StudioHistoryManager {
  private undoStack: StudioProject[] = [];
  private redoStack: StudioProject[] = [];
  private maxDepth = 30;

  constructor(initialProject: StudioProject) {
    this.undoStack = [JSON.parse(JSON.stringify(initialProject))];
    this.redoStack = [];
  }

  push(project: StudioProject) {
    const clone = JSON.parse(JSON.stringify(project));
    this.undoStack.push(clone);
    if (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo on new action
  }

  canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo(): StudioProject | null {
    if (!this.canUndo()) return null;
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);
    const previous = this.undoStack[this.undoStack.length - 1];
    return JSON.parse(JSON.stringify(previous));
  }

  redo(): StudioProject | null {
    if (!this.canRedo()) return null;
    const next = this.redoStack.pop()!;
    this.undoStack.push(next);
    return JSON.parse(JSON.stringify(next));
  }
}
