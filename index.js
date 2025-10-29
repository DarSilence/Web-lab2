var description = document.createElement("div");
description.classList.add("description");
description.id = "description";

var find_line = document.createElement("div");
find_line.classList.add("find_line");
find_line.id = "find_line";

var select = document.createElement("select");
select.classList.add("selector");
select.id = "selector";
let filters = ["все", "выполненные", "невыполненные"];

for (step = 0; step < 3; step++) {
    let option = document.createElement("option");
    option.value = step;
    option.textContent = filters[step];
    select.appendChild(option);
}

select.addEventListener('change', () => {
    updateTasks();
})

find_line.appendChild(select);

var content = new Map()
content.set(0, [1, "по возрастанию"])
content.set(1, [-1, "по возрастанию"])
content.set(-1, [1, "по убыванию"])
var time_sort = document.createElement("div");
time_sort.classList.add("time_sort");
time_sort.id = "time_sort";
time_sort.textContent = "по возрастанию";
time_sort.value = 0;
time_sort.addEventListener('click', () => {
    time_sort.textContent = content.get(time_sort.value)[1];
    time_sort.value = content.get(time_sort.value)[0];
    updateTasks();
})

find_line.appendChild(time_sort);

var name_search = document.createElement("input");
name_search.classList.add("name_search");
name_search.id = "name_search";
name_search.textContent = "";
name_search.addEventListener('input', () => {
    updateTasks(name_search.value);
})

find_line.appendChild(name_search);


let names = ["Статус", "Дата", "Название"]
for (step = 0; step < 3; step++) {
    let column_name = document.createElement('div');
    column_name.textContent = names[step];
    description.appendChild(column_name);
}

var add_button = document.createElement("button");
add_button.classList.add("add_button");
add_button.id = "add_button";
add_button.textContent = "Добавить задачу"

add_button.addEventListener('click', () =>{
    addTask();
})

var field = document.createElement("div");
field.className = "field";
field.id = "field";

field.addEventListener(`dragstart`, (evt) => {
    evt.target.classList.add(`selected`);
})

field.addEventListener(`dragend`, (evt) => {
    evt.target.classList.remove(`selected`);
});

const getNextElement = (cursorPosition, currentElement) => {
    const currentElementCoord = currentElement.getBoundingClientRect();
    const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;

    const nextElement = (cursorPosition < currentElementCenter) ?
        currentElement :
        currentElement.nextElementSibling;

    return nextElement;
};

field.addEventListener(`dragover`, (evt) => {
    evt.preventDefault();

    const activeElement = field.querySelector(`.selected`);
    const currentElement = evt.target;
    const isMoveable = activeElement !== currentElement &&
    (currentElement.classList.contains(`task`) ||
    currentElement.classList.contains(`checked_task`));

    if (!isMoveable) {
    return;
    }

    // evt.clientY — вертикальная координата курсора в момент,
    // когда сработало событие
    const nextElement = getNextElement(evt.clientY, currentElement);

    // Проверяем, нужно ли менять элементы местами
    if (
    nextElement && 
    activeElement === nextElement.previousElementSibling ||
    activeElement === nextElement
    ) {
    // Если нет, выходим из функции, чтобы избежать лишних изменений в DOM
    return;
    }

    field.insertBefore(activeElement, nextElement);
    updateOrder();
});

var index = 0;

var tasks = [];

setUpPage();

function updateOrder() {
    tasks = [];
    let childrenTasks = field.childNodes;
    childrenTasks.forEach(task => tasks.push(task));
    saveTasks();
}

function saveTasks() {
    try{
        localStorage.clear();
        let count = 0;
        tasks.forEach(task => {
            const children = task.childNodes;
            var step;
            let name = "";
            let today = "";
            let status = "";

            for (step = 0; step < 5; step++) {
                if (children[step].className == "task_input"){
                    name = children[step].value;
                }
                if (children[step].className == "task_date"){
                    let now_date = children[step].valueAsDate;
                    var day = ("0" + now_date.getDate()).slice(-2);
                    var month = ("0" + (now_date.getMonth() + 1)).slice(-2);
                    today = (day)+"-"+(month)+"-"+now_date.getFullYear();
                }
                if (children[step].className == "status"){
                    status = children[step].checked;
                }
            };

            localStorage.setItem(`${count}`, `${today} ${name} ${status}`);
            count++;
        });
    } catch {
        return;
    }
}

function readTasks() {
    try{
        let count = localStorage.length;
        for (step = 0; step < count; step++){
            let variables = localStorage.getItem(`${step}`).split(" ");
            console.log(variables);
            variables[0] = new Date(Number(variables[0].slice(6)),
                                    Number(variables[0].slice(3, 5)) - 1,
                                    Number(variables[0].slice(0, 2)) + 1);
            console.log(variables[0]);
            variables[variables.length - 1] = (variables[variables.length - 1] == "true");
            console.log(variables[variables.length - 1]);
            for (index = 2; index < variables.length - 1; index++){
                variables[1] += " " + variables[index];
            }
            console.log(variables[1]);
            createTask(date=variables[0], variables[1], variables[variables.length - 1]);
        }
    } catch {
        return;
    }
}

function setUpPage() {
    let page = document.body;

    page.append(add_button);
    page.append(description);
    page.append(find_line);
    page.append(field);
    readTasks();
    updateTasks();
}

function createTask(date, name="Пустая задача", completed=false){
    let task = document.createElement("div");
    task.classList.add("task");
    task.id = "task" + index;
    task.draggable = true;

    let task_input = document.createElement("input");
    task_input.classList.add("task_input");
    task_input.id = "input" + index;
    task_input.value = name;
    task_input.disabled = true;

    let task_date = document.createElement("input");
    task_date.classList.add("task_date");
    task_date.id = "date" + index;
    task_date.type = "date";
    task_date.valueAsDate = date;
    task_date.disabled = true;

    let delete_button = document.createElement("button");
    delete_button.classList.add("delete_button");
    delete_button.id = "delete_button" + index;
    delete_button.textContent = "X";
    delete_button.addEventListener('click', () => {
        deleteTask(task.id);
    })

    let status = document.createElement("input");
    status.classList.add("status");
    status.id = "status" + index;
    status.type = "checkbox";
    status.checked = completed;
    status.addEventListener('click', () => {
        changeStatus(task.id, status.checked);
        updateTasks();
    })

    let change_button = document.createElement("button");
    change_button.classList.add("change_button");
    change_button.id = "change_button" + index;
    change_button.textContent = "Изменить";
    change_button.addEventListener("click", ()=> {
        changeTask(task.id);
    })

    task.appendChild(status);
    task.appendChild(task_date);
    task.appendChild(task_input);
    task.appendChild(change_button);
    task.appendChild(delete_button);

    index += 1;
    
    tasks.push(task);
    return task;
}

function deleteTask(id) {
    document.getElementById(id).remove();
    
    tasks = tasks.filter(element => element.id != id);
    saveTasks();
}

function changeTask(id) {
    let task = document.getElementById(id);
    const children = task.childNodes;
    children.forEach(part => {
        if (part.className == "task_date" || part.className == "task_input"){
            if (part.disabled){
                part.disabled = false;
            } else {
                part.disabled = true;
            }
        } 
        if (part.className == "change_button"){
            part.classList.remove("change_button");
            part.classList.add("confirm_button");
            part.textContent = "Подтвердить";
        } else if (part.className == "confirm_button"){
            part.classList.remove("confirm_button");
            part.classList.add("change_button");
            part.textContent = "Изменить";
            updateTasks();
        }
    })
}

function changeStatus(id, value){
    let task = document.getElementById(id);
    if (value){
        task.classList.remove("task");
        task.classList.add("checked_task");
    } else {
        task.classList.remove("checked_task");
        task.classList.add("task");
    }
}

function addTask() {
    const now = new Date(); 
    createTask(now);
    updateTasks();
}

function elementGetDate(element) {
    return element.childNodes[1].valueAsDate;
}

function elementGetName(element) {
    return element.childNodes[2].value;
}

function elementsGetByDate(date) {
    for (step = 0; step < tasks.length; step++) {
        let cur_date = tasks[step].childNodes[1].valueAsDate;
        if (cur_date == date){
            return tasks[step];
        }
    }
}

function updateTasks(name="") {
    if (name != ""){
        select.selectedIndex = 0;
        time_sort.value = 0;
        time_sort.textContent = content.get(0)[1];
    } else {
        name_search.value = "";
    }
    filtration = select.selectedIndex;
    condition = time_sort.value;
    console.log(name);

    let to_remove = [];
    field.childNodes.forEach(element => to_remove.push(element));
    for (step = 0; step < to_remove.length; step++){
        field.removeChild(to_remove[step]);
    }
    
    let to_show = [];

    for (step = 0; step < tasks.length; step++){
        if (filtration == 0){
            if (name.toLowerCase() == elementGetName(tasks[step]).slice(0, name.length).toLowerCase()){
                to_show.push(tasks[step]);
            }
        } else if (filtration == 1 & tasks[step].childNodes[0].checked){
            to_show.push(tasks[step]);
        } else if (filtration == 2 & !(tasks[step].childNodes[0].checked)){
            to_show.push(tasks[step]);
        }
    }
    
    let dates = [];

    if (condition != 0){
        for (step = 0; step < to_show.length; step++){
            dates.push([elementGetDate(to_show[step]), to_show[step]])
        }

        dates.sort((a, b) => condition * (b[0] - a[0]));
        console.log(dates);

        for (step = 0; step < to_show.length; step++){
            to_show[step] = dates[step][1];
        }
    }

    for (step = 0; step < to_show.length; step++){
        field.appendChild(to_show[step]);
    }

    saveTasks();
}
