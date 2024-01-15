import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ToastContainer, toast } from 'react-toastify';

import TaskManager from './Class/TaskManager'
import Task from './interface'

import './App.css'
import 'react-toastify/dist/ReactToastify.css';

function App() {

    const [task, setTask] = useState<Task>({
        id: 0, taskName: "", taskDescription: "", taskState:1, index : 0
    })

    const [taskList, setTasks] = useState <Task[]>([])
    const taskManager = new TaskManager("http://localhost:8888")

    //Appel de getTasks() au lancement
    useEffect(() => {
        getTasks()
    }, []) 

    //Notification avec react-toastify
    const notify = (msg: string) => toast.error(msg);

    //rÈcupÈration des valeurs de la promesse HTTP dans taskList du useState()
    async function getTasks() {
        try {
            const res = await fetch('http://localhost:8888/tasklist')
            const data = await res.json();
            setTasks(data)
        } catch (e) {
            console.error(e)
        }
    }

    //RÈcuperation d'une t‚che dans la variable task du useState
    function getTaskById(idTask:number){
        taskList.filter(tasks => tasks.id == idTask).map(task => {
            let t: Task = task

            setTask(t)
            reset({
                id: task.id,
                taskName: task.taskName,
                taskDescription: task.taskDescription
            })
        })
    }

    
    //Formulaire avec react-hook-form et initialisation des valeurs par dÈfaut
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            id: task.id,
            taskName: task.taskName,
            taskDescription: task.taskDescription,
        }
    });

    //reset des valeurs par dÈfaut du formulaire et de la t‚che
    function clearForm() {
        reset({
            id: 0,
            taskName: "",
            taskDescription: ""
        })

        setTask({
            id: 0, taskName: "", taskDescription: "", taskState: 1, index: 0
        })
    }

    //Validation du formulaire
    const onSubmit = (data: any) => {

        console.log(data)

        let state:number = task.taskState
        let valId = data.id == 0 ? Date.now() : data.id
        let lastIndex: number = taskManager.getLastIndexByState(state, taskList)
        let index:number =  data.id == 0 ? lastIndex+1 : task.index

        console.log(data)

        let t: Task = {
            id: valId,
            taskName: data.taskName,
            taskDescription: data.taskDescription,
            taskState: state, 
            index : index
        }

        if (task.id != 0) {    
            taskManager.updateTask(t).then(() => getTasks())
        } else {
            taskManager.addTask(t).then(() => getTasks())
            clearForm()
        }
    }

    //Suppression d'une t‚che
    function deleteTask(e: any) {
        if (confirm("Voulez-vous supprimer d√©finitivement cette t√¢che ?") == true) {
            let idTask: number = e.target.parentElement.parentElement.getAttribute("data-rbd-draggable-id")
            taskManager.deleteTask(idTask).then(() => getTasks())
        } 
    }
    
    //Drad and Drop avec react-beautiful-dnd
    const dragNdrop = (results: any) => {

        if (!results.destination) {
            notify("La cible n'est pas correcte")
            return
        }
        let taskStateSource: number = results.source.droppableId
        let taskStateDestination: number = results.destination.droppableId
        let newIndex: number = results.destination.index
        let idTask = results.draggableId

        taskList.filter(tasks => tasks.id == idTask).map(task => {
            let t: Task = task
            setTask(t)
        })

       
        if (taskManager.verificationMove(taskStateDestination, taskStateSource)) {
               
            let newTask: Task = {
                id: task.id,
                taskName: task.taskName,
                taskDescription: task.taskDescription,
                taskState: taskStateDestination,
                index: newIndex
            }
            //taskManager.changeIndexationByState(taskStateDestination, taskList, newIndex)
            taskManager.updateTask(newTask).then(() => getTasks())

        } else {
            notify("D√©placement non autoris√©")
        } 
        
        clearForm()
    }

    //Selection d'une t‚che pour dnd
    function selectTask(e: any) {
        let idTask: number = e.target.parentElement.parentElement.getAttribute("data-rbd-draggable-id")
        getTaskById(idTask)
    }

    //identification d'une t‚che lors de la sÈlection d'une t‚che en dnd
    const identifyTask = (results: any) => {
        let idTask = results.draggableId
        taskList.filter(tasks => tasks.id == idTask).map(task => {
            let t: Task = task
            setTask(t)
        })
    }

    return <>
        <div className="container">
            <div>
                <ToastContainer position="top-right"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    theme="dark" />
            </div>
            
            <div className="row align-items-start">
                <div className="col-3">
                    <h4>{task.id != 0 ? "Modification de t√¢che" : "Ajout d'une t√¢che"}</h4>
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="mb-3">
                                    <input id="id" className="form-control" type="hidden" {...register('id')} />
                                </div>
                                <div className="mb-3">
                                        <label htmlFor="taskname" className="form-label" >Nom de la t√¢che : </label>
                                        <input id="taskname" className="form-control" type="text" {...register('taskName', { required: "Veuillez entrer le nom de la t‚che" })}  />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="taskdescription" className="form-label ">Description : </label>
                                    <textarea id="taskdescription" className="form-control text-area-description" {...register("taskDescription")} ></textarea>
                                </div>
                                <div className="mb-3">
                                    <div className="row">
                                        <div className="col-6">
                                            <button type="submit">Enregistrer</button>
                                        </div>
                                        <div className="col-6">
                                            <button type="button" className="width100" onClick={clearForm}>Annuler</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <DragDropContext onDragEnd={dragNdrop} onBeforeDragStart={identifyTask}>
                    <div className="col-3 text-center">
                            <div className="alert text-bg-light">To do </div>
                            <Droppable droppableId="1" type="group">
                                {(provided) => (
                                <div className="container" {...provided.droppableProps} ref={provided.innerRef}>
                                    {taskList.filter(tasks => tasks.taskState == 1).sort(function (a, b) {
                                            return a.index - b.index
                                            }).map((task, index) => (
                                            <Draggable draggableId={""+task.id} key={task.id} index={index}>
                                                {(provided) => (
                                                    
                                                    <div className="card" {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
                                                        <div className="card-body">
                                                        <h6 className="card-title">{task.taskName}</h6>
                                                        <a className="card-link" onClick={deleteTask}>Supprimer</a>
                                                        <a className="card-link" onClick={selectTask}>Modifier</a>
                                                        </div>
                                                    </div>
                                                )} 
                                   
                                    </Draggable>
                                    ))}
                                </div>
                            )}
                            </Droppable>
                    </div>

                    <div className="col-3 text-center">
                        <div className="alert text-bg-warning">Doing</div>
                        <Droppable droppableId="2" type="group">
                            {(provided) => (
                                <div className="container" {...provided.droppableProps} ref={provided.innerRef}>
                                    {taskList.filter(tasks => tasks.taskState == 2).sort(function (a, b) {
                                        return a.index - b.index
                                    }).map((task, index) => (
                                        <Draggable draggableId={"" + task.id} key={task.id} index={index}>
                                            {(provided) => (
                                                <div className="card" {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
                                                    <div className="card-body">
                                                        <h6 className="card-title">{task.taskName}</h6>
                                                        <a className="card-link" onClick={deleteTask}>Supprimer</a>
                                                        <a className="card-link" onClick={selectTask}>Modifier</a>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                </div>
                            )}
                        </Droppable>
                    </div>
                
                    <div className="col-3 text-center">
                        <div className="alert text-bg-success">Done</div>
                        <Droppable droppableId="3" type="group">
                            {(provided) => (
                                <div className="container" {...provided.droppableProps} ref={provided.innerRef}>
                                    {taskList.filter(tasks => tasks.taskState == 3).sort(function (a, b) {
                                        return a.index - b.index
                                    }).map((task, index) => (
                                        <Draggable draggableId={"" + task.id} key={task.id} index={index}>
                                            {(provided) => (
                                                <div className="card" {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
                                                    <div className="card-body">
                                                        <h6 className="card-title">{task.taskName}</h6>
                                                        <a className="card-link" onClick={deleteTask}>Supprimer</a>
                                                        <a className="card-link" onClick={selectTask}>Modifier</a>
                                                    </div>
                                                </div>
                                            )}

                                        </Draggable>
                                    ))}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </DragDropContext>
            </div>
        </div>
        
    </> 
}    
export default App