const express = require("express");
const multer = require("multer");
const app = express();
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const uri = process.env.DATABASE;

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// mongoose.connect("mongodb://localhost:27017/todoDB");

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
  });

const todoSchema = new mongoose.Schema({
  taskImage: String,
  taskText: String,
  completed: Boolean,
  id: Number,
});

const Todo = mongoose.model("todo", todoSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/tasks", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.log("SOMETHING WENT WRONG!");
  }
});

app.post("/task", upload.single("image"), async (req, res) => {
  // console.log(req.body);
  // console.log(req.file);
  try {
    const todos = await Todo.find();
    // console.log(todos.length);
    const newTaskId = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
    const newTask = {
      taskImage: req.file.filename,
      taskText: req.body.taskText,
      completed: false,
      id: newTaskId,
    };
    const todo = new Todo(newTask);
    await todo.save();
    res.json(newTask);
  } catch (error) {
    console.log(error.message);
  }
});

app.delete("/task/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id); //re.params.id will give us the endpoint and save it to taskId
    const taskToDelete = await Todo.findOne({ id: taskId });

    const imageToDelete = `public/${taskToDelete.taskImage}`;
    fs.unlink(imageToDelete, (err) => {
      if (err) console.log("ERROR DELETING!", err);
    });

    await Todo.deleteOne({ id: taskId });
    res.json({ message: "Task deleted successfully.", taskId }); //give back the taskId and a message
  } catch (error) {
    console.log(error.message);
  }
});

app.put("/task/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id); //save the id to variable taskID
    const completed = req.body.completeStatus; //save the sent data to completed varaible
    await Todo.updateOne({ id: taskId }, { completed: completed });
    const task = await Todo.find({ taskId });
    res.json({ message: "Task updated successfully.", task }); //return the modified task back
  } catch (error) {
    console.error(e.message);
  }
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
