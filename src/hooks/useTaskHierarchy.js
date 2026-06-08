import { useMemo } from 'react';

/**
 * useTaskHierarchy
 * Organizes tasks from a flat list returned by student_list API into a parent-subtask hierarchy.
 * Handles deduplication and extraction of parent tasks even if they only appear nested under subtasks.
 *
 * @param {Object} taskListData - The API response data containing task content
 * @param {string|number} selectedParentTaskId - The currently selected parent task ID
 */
const useTaskHierarchy = (taskListData, selectedParentTaskId) => {
    const parentTasks = useMemo(() => {
        const list = taskListData?.content || [];
        const parentMap = new Map();

        // 1. First collect all tasks that are explicitly defined as parents (kind === 1)
        list.forEach((task) => {
            if (task && task.kind === 1 && task.id) {
                parentMap.set(task.id, task);
            }
        });

        // 2. Second, scan subtasks (kind === 2) and extract parent details if parent object exists
        // This handles cases where parent tasks are not returned as standalone items
        list.forEach((task) => {
            if (task && task.kind === 2 && task.parent && task.parent.id) {
                const parentId = task.parent.id;
                if (!parentMap.has(parentId)) {
                    // Extract the parent object and mark its kind as 1
                    parentMap.set(parentId, {
                        ...task.parent,
                        kind: 1,
                    });
                }
            }
        });

        // Convert map to array and sort by orderInParent
        return Array.from(parentMap.values()).sort((a, b) => (a.orderInParent || 0) - (b.orderInParent || 0));
    }, [taskListData]);

    // Determine the active parent ID (fallback to the first parent in the list if none selected)
    const defaultSelectedParentId = useMemo(() => {
        if (!selectedParentTaskId && parentTasks.length > 0) {
            return parentTasks[0].id;
        }
        return selectedParentTaskId;
    }, [parentTasks, selectedParentTaskId]);

    // Filter subtasks (kind === 2) belonging to the active parent task
    const subtasks = useMemo(() => {
        if (!defaultSelectedParentId) {
            return [];
        }
        const list = taskListData?.content || [];
        return list
            .filter(
                (t) =>
                    t &&
                    t.kind === 2 &&
                    (t.parent?.id === defaultSelectedParentId ||
                        t.parentId === defaultSelectedParentId ||
                        t.taskId === defaultSelectedParentId),
            )
            .sort((a, b) => (a.orderInParent || 0) - (b.orderInParent || 0));
    }, [taskListData, defaultSelectedParentId]);

    return { parentTasks, defaultSelectedParentId, subtasks };
};

export default useTaskHierarchy;
