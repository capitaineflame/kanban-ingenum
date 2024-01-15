import Task from './../interface'
export default class TaskManager {

    private default_path:string

    constructor(path: string) {
        this.default_path = path 
    }

    async addTask(task: Task) {

        return await fetch(this.default_path + '/tasklist', {
            method: 'POST',
            body: JSON.stringify(task)
        })
    }

    async deleteTask(idTask: number) {
        return await fetch(this.default_path + '/deleteTask', {
            method: 'POST',
            body: JSON.stringify({"id":idTask})
        })
    }

    async updateTask(newTask: Task) {

        return await fetch(this.default_path + '/updateTask', {
            method: 'POST',
            body: JSON.stringify(newTask)
        })
    }

    public  verificationMove(newState: number, oldState: number): boolean {
        if (newState > 3 || newState < 1) return false;

        let diff = newState - oldState
        if (diff != 1 && diff != -1 && diff != 0) return false

        return true
    }


    public getLastIndexByState(state: number, tasks: Task[]): number {

        let index:number = 0

        let tasksCopy: Task[] = tasks.filter(task => task.taskState == state)

        if (tasksCopy.length > 0) {
            tasksCopy.map(t => {
                if (t.index > index) {
                    index = t.index
                }
            })
        }

        return index
    }

    public changeIndexationByState(state: number, tasks: Task[], start: number) {

        //console.log(state, tasks, start)
        tasks.filter(task => task.taskState == state).sort(function (a, b) {
            return a.index - b.index
        }).map(t => {
            
            if (t.index >= start) {
                console.log(t)
                t.index++
                this.updateTask(t)
            }
        })

    }

}

