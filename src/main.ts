import type { Note } from "./types";
import { invoke } from "@tauri-apps/api/core";

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const charCount = document.getElementById("char-count")!;
const lineCount = document.getElementById("line-count")!;
const noteList = document.getElementById("note-list")!;
const btnNew = document.getElementById("btn-new")!;

let notes: Note[] = [];
let activeNoteId = 0;
let nextId = 1;

async function syncToRust(note: Note) {
  await invoke("save_note", { id: note.id, title: note.title, content: note.content });
}

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
    div.addEventListener("click", () => switchNote(note.id));
    noteList.appendChild(div);
  }
}

function switchNote(id: number) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  activeNoteId = id;
  editor.value = note.content;
  updateStats();
  renderNoteList();
}

async function createNote() {
  const id = nextId++;
  const note: Note = { id, title: "新笔记", content: "" };
  notes.push(note);
  switchNote(id);
  await syncToRust(note);
}

editor.addEventListener("input", async () => {
  const note = notes.find((n) => n.id === activeNoteId);
  if (note) {
    note.content = editor.value;
    note.title = editor.value.split("\n")[0].replace(/^#+\s*/, "").trim() || "新笔记";
    await syncToRust(note);
    renderNoteList();
  }
  updateStats();
});

btnNew.addEventListener("click", createNote);

async function init() {
  try {
    notes = await invoke<Note[]>("list_notes");
  } catch {}
  if (notes.length === 0) {
    notes = [{ id: 1, title: "欢迎使用 NoteX", content: "# 欢迎使用 NoteX\n\n这是一个简单的记事本应用。" }];
    await syncToRust(notes[0]);
  }
  nextId = Math.max(...notes.map((n) => n.id)) + 1;
  switchNote(notes[0].id);
}

init();
