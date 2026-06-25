import type { Note } from "./types";
import { invoke } from "@tauri-apps/api/core";

// DOM 元素引用
const editor = document.getElementById("editor") as HTMLTextAreaElement;
const charCount = document.getElementById("char-count")!;
const lineCount = document.getElementById("line-count")!;
const noteList = document.getElementById("note-list")!;
const btnNew = document.getElementById("btn-new")!;

// 应用状态
let notes: Note[] = [
  { id: 1, title: "欢迎使用 NoteX", content: "# 欢迎使用 NoteX\n\n这是一个简单的记事本应用。" },
];
let activeNoteId = 1;

// 更新底部状态栏
function updateStats() {
  const text = editor.value;
  charCount.textContent = `${text.length} 字`;
  lineCount.textContent = `${text.split("\n").length} 行`;
}

// 渲染笔记列表
function renderNoteList() {
  noteList.innerHTML = "";
  for (const note of notes) {
    const div = document.createElement("div");
    div.className = `note-item${note.id === activeNoteId ? " active" : ""}`;
    div.dataset.id = String(note.id);
    div.textContent = note.title;
    div.addEventListener("click", () => switchNote(note.id));
    noteList.appendChild(div);
  }
}

// 切换当前笔记
async function switchNote(id: number) {
  const note = await invoke<Note>("load_note", { id });
  activeNoteId = note.id;
  editor.value = note.content;
  updateStats();
  renderNoteList();
}

// 新建笔记
function createNote() {
  const id = Date.now();
  const note: Note = { id, title: "新笔记", content: "" };
  notes.push(note);
  switchNote(id);
}

// 编辑区输入事件：同步内容到状态
editor.addEventListener("input", async () => {
  const note = notes.find((n) => n.id === activeNoteId);
  if (note) {
    note.content = editor.value;
    const firstLine = editor.value.split("\n")[0].replace(/^#+\s*/, "").trim();
    note.title = firstLine || "新笔记";
    await invoke("save_note", {
      id: note.id,
      title: note.title,
      content: note.content,
    });
    renderNoteList();
  }
  updateStats();
});

// 新建按钮点击事件
btnNew.addEventListener("click", createNote);

// 初始化渲染
renderNoteList();
updateStats();
