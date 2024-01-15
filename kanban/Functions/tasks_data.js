import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/Data/task.json'

/**
 * @typedef {object} Task
 * @property {number} id
 * @property {string} taskName
 * @property {string} taskDescription
 * @property {number} taskState
 */

export async function listTask() {

    try {
        const data = await readFile(path, 'utf8')

        if (data) {
            return JSON.parse(data)
        }
        else{
            return []
        }
        
    } catch (e) {
        console.error(e)
    }
    
}

export async function addTask({ id, taskName, taskDescription, taskState, index }) {

    const task = {
        id, taskName, taskDescription, taskState, index
    }
    const tasks = [task, ...await listTask()]

    await writeFile(path, JSON.stringify(tasks))

    return task
}

export async function updateTask({ id, taskName, taskDescription, taskState, index}) {

    const task = {
        id, taskName, taskDescription, taskState, index
    }

    const data = await readFile(path, 'utf8')

    const tasks = JSON.parse(data)

    for (let i = 0; i < tasks.length; i++) {

        if (tasks[i].id == id) {
            tasks.splice(i,1,task)
        }
    }
    await writeFile(path, JSON.stringify(tasks))

}
export async function deleteTask(jsonResult) {

    const data = await readFile(path, 'utf8')

    let tasks = JSON.parse(data)

    let idTask = jsonResult.id

    for (let i = 0; i < tasks.length; i++) {
        
        if (tasks[i].id == idTask) {
            try {
                tasks.splice(i, 1)
            } catch (error) {
                console.error( error);
            }
        }
    }

    await writeFile(path, JSON.stringify(tasks))

}