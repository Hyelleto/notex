import type { Note } from "./types";

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const charCount = document.getElementById("char-count")!;
const lineCount = document.getElementById("line-count")!;
const noteList = document.getElementById("note-list")!;
const btnNew = document.getElementById("btn-new")!;

let notes: Note[] = [
  { id: 1, title: "欢迎使用 NoteX", content: "# 欢迎使用 NoteX\n\n这是一个简单的记事本应用。" },
];
let activeNoteId = 1;

function updateStats() {
  charCount.textContent = `${editor.value.length} 字`;
  lineCount.textContent = `${editor.value.split("\n").length} 行`;
}

function renderNoteList() {
  noteList.innerHTML = "";
  for (const note of notes) {
    const div = document.createElement("div");
    div.className = `note-item${note.id === activeNoteId ? " active" : ""}`;
    div.textContent = note.title;
    div.addEventListener("click", () => { activeNoteId = note.id; editor.value = note.content; updateStats(); renderNoteList(); });
    noteList.appendChild(div);
  }
}

function createNote() {
  const id = Date.now();
  notes.push({ id, title: "新笔记", content: "" });
  activeNoteId = id; editor.value = ""; updateStats(); renderNoteList();
}

editor.addEventListener("input", () => {
  const note = notes.find((n) => n.id === activeNoteId);
  if (note) { note.content = editor.value; note.title = editor.value.split("\n")[0].replace(/^#+\s*/, "").trim() || "新笔记"; renderNoteList(); }
  updateStats();
});

btnNew.addEventListener("click", createNote);
renderNoteList();
updateStats();
