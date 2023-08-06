// const { text } = require("express");

const form = document.getElementById("task-input-form");

getExistingTasks();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskText = document.querySelector("#task-input").value.trim();
  const image = document.querySelector("#image-input").files[0];
  // console.log(taskText, image);
  if (taskText !== "") {
    const formData = new FormData();
    formData.append("taskText", taskText);
    formData.append("image", image);

    fetch("/task", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // console.log(data);
        createTaskElement(
          data.taskText,
          data.taskImage,
          data.id,
          data.completed
        );
      });
  } else {
    alert("PLEASE ENTER A VALID TASK!");
    return;
  }
  document.querySelector("#task-input").value = "";
});

function createTaskElement(taskText, taskImage, id, completed) {
  const newTask = document.createElement("li");
  newTask.setAttribute("data-task-id", id);
  newTask.classList.add("todo");
  newTask.innerHTML = `<span class="todo-text">${taskText}</span>
    <div class="buttons-container">
    <img src="./public/images/${taskImage}" alt="" />
      <button class="button delete-button">Delete</button>
      <button class="button complete-button">Complete</button>`;
  const todoList = document.querySelector(".todo-list");
  if (completed) {
    newTask.classList.add("completed-list");
    newTask.firstChild.classList.add("line-through");
  }
  todoList.append(newTask);

  const deleteButton = newTask.querySelector(".delete-button");
  deleteButton.addEventListener("click", () => {
    deleteTask(id);
  });

  const completeButton = newTask.querySelector(".complete-button");
  completeButton.addEventListener("click", () => {
    toggleCompleteTask(id, !completed);
    completed = !completed;
  });

  todoList.scrollTop = todoList.scrollHeight;
  // console.log(todoList.scrollTop);
}

function getExistingTasks() {
  fetch("/tasks")
    .then((res) => {
      return res.json();
    })
    .then((tasks) => {
      // console.log(tasks);
      for (let data of tasks) {
        createTaskElement(
          data.taskText,
          data.taskImage,
          data.id,
          data.completed
        );
      }
    });
}

function deleteTask(id) {
  fetch(`/task/${id}`, {
    method: "DELETE",
  }).then(() => {
    //select the li(task) with the required data-task-id and assign the element to variable taskItem
    //[data-task-id=taskId] is the attribute selector(we can select elements using attributes)
    const taskItem = document.querySelector(`li[data-task-id="${id}"]`);
    //remove the ID from the UI
    taskItem.remove();
  });
}

function toggleCompleteTask(id, completeStatus) {
  fetch(`/task/${id}`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ completeStatus }),
  }).then(() => {
    const taskItem = document.querySelector(`li[data-task-id="${id}"]`);
    // taskItem.classList.toggle("completed-list");
    // taskItem.firstElementChild.classList.toggle("completed", completed);

    taskItem.classList.toggle("completed-list");
    taskItem.firstChild.classList.toggle("line-through");
  });
}
