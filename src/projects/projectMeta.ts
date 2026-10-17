export interface ProjectLocalMeta {
  description: string;
  templateId: string;
  installedLibraryIds: string[];
}

const PREFIX = 'nila:project-meta:';
const fallback = (): ProjectLocalMeta => ({ description: '', templateId: 'blank', installedLibraryIds: [] });

export function getProjectMeta(projectId: string): ProjectLocalMeta {
  try {
    const raw = localStorage.getItem(`${PREFIX}${projectId}`);
    if (!raw) return fallback();
    const value = JSON.parse(raw) as Partial<ProjectLocalMeta>;
    return {
      description: typeof value.description === 'string' ? value.description : '',
      templateId: typeof value.templateId === 'string' ? value.templateId : 'blank',
      installedLibraryIds: Array.isArray(value.installedLibraryIds) ? value.installedLibraryIds.filter((item): item is string => typeof item === 'string') : [],
    };
  } catch {
    return fallback();
  }
}

export function saveProjectMeta(projectId: string, patch: Partial<ProjectLocalMeta>): ProjectLocalMeta {
  const next = { ...getProjectMeta(projectId), ...patch };
  localStorage.setItem(`${PREFIX}${projectId}`, JSON.stringify(next));
  return next;
}

export function deleteProjectMeta(projectId: string) {
  localStorage.removeItem(`${PREFIX}${projectId}`);
}
