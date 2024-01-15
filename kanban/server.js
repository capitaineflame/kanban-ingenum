import { createServer } from 'node:http'
import { json } from "node:stream/consumers"
import { addTask, listTask, deleteTask, updateTask } from './Functions/tasks_data.js'

const server = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')

    const url = new URL(req.url, `http://${req.headers.host}`)

    const path_method = url.pathname + "/" + req.method

    switch (path_method) {

        case '/tasklist/GET' :
            const tasks = await listTask()
            res.write(JSON.stringify(tasks))
            break

        case '/tasklist/POST':
            
            const newTask = await json(req)
            let task = await addTask(newTask)
            res.write(JSON.stringify(task))
            break

        case '/deleteTask/POST':

            const idTask = await json(req)
            await deleteTask(idTask)

            break

        case '/updateTask/POST':

            const taskUpdated = await json(req)
            await updateTask(taskUpdated)

            break

        default:
            res.writeHead(404)
    }

    res.end()
})

server.listen('8888')