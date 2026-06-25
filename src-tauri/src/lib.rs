use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::Builder;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Note {
    pub id: u32,
    pub title: String,
    pub content: String,
}

pub type NoteStore = Mutex<HashMap<u32, Note>>;

pub fn store_save(store: &mut HashMap<u32, Note>, note: Note) {
    store.insert(note.id, note);
}

pub fn store_load(store: &HashMap<u32, Note>, id: u32) -> Option<Note> {
    store.get(&id).cloned()
}

pub fn store_list(store: &HashMap<u32, Note>) -> Vec<Note> {
    store.values().cloned().collect()
}

fn cmd_save(store: &NoteStore, id: u32, title: String, content: String) -> Result<(), String> {
    let mut map = store.lock().map_err(|e| e.to_string())?;
    store_save(&mut map, Note { id, title, content });
    Ok(())
}

fn cmd_load(store: &NoteStore, id: u32) -> Result<Note, String> {
    let map = store.lock().map_err(|e| e.to_string())?;
    store_load(&map, id).ok_or_else(|| format!("笔记 {} 不存在", id))
}

fn cmd_list(store: &NoteStore) -> Result<Vec<Note>, String> {
    let map = store.lock().map_err(|e| e.to_string())?;
    Ok(store_list(&map))
}

#[tauri::command]
fn save_note(store: tauri::State<'_, NoteStore>, id: u32, title: String, content: String) -> Result<(), String> {
    cmd_save(&store, id, title, content)
}

#[tauri::command]
fn load_note(store: tauri::State<'_, NoteStore>, id: u32) -> Result<Note, String> {
    cmd_load(&store, id)
}

#[tauri::command]
fn list_notes(store: tauri::State<'_, NoteStore>) -> Result<Vec<Note>, String> {
    cmd_list(&store)
}

pub fn run() {
    Builder::default()
        .manage(NoteStore::default())
        .invoke_handler(tauri::generate_handler![save_note, load_note, list_notes])
        .run(tauri::generate_context!())
        .expect("error");
}

#[cfg(test)]
mod tests {
    use super::*;

    // ========== 单元测试 ==========

    #[test]
    fn test_store_save_and_load() {
        let mut store = HashMap::new();
        let note = Note { id: 1, title: "标题".into(), content: "内容".into() };
        store_save(&mut store, note.clone());
        assert_eq!(store_load(&store, 1).unwrap(), note);
    }

    #[test]
    fn test_store_load_nonexistent() {
        let store = HashMap::new();
        assert!(store_load(&store, 99).is_none());
    }

    #[test]
    fn test_store_overwrite() {
        let mut store = HashMap::new();
        store_save(&mut store, Note { id: 1, title: "旧".into(), content: "".into() });
        store_save(&mut store, Note { id: 1, title: "新".into(), content: "".into() });
        assert_eq!(store_load(&store, 1).unwrap().title, "新");
    }

    #[test]
    fn test_store_list() {
        let mut store = HashMap::new();
        store_save(&mut store, Note { id: 1, title: "a".into(), content: "".into() });
        store_save(&mut store, Note { id: 2, title: "b".into(), content: "".into() });
        assert_eq!(store_list(&store).len(), 2);
    }

    #[test]
    fn test_note_serialize() {
        let note = Note { id: 1, title: "t".into(), content: "c".into() };
        let json = serde_json::to_string(&note).unwrap();
        assert!(json.contains("\"id\":1"));
    }

    #[test]
    fn test_note_deserialize() {
        let json = r#"{"id":2,"title":"t","content":"c"}"#;
        let note: Note = serde_json::from_str(json).unwrap();
        assert_eq!(note.id, 2);
    }

    // ========== 集成测试 ==========

    // US5：编辑后切回来内容还在
    #[test]
    fn us5_edit_and_switch_back() {
        let store = NoteStore::default();
        cmd_save(&store, 1, "新笔记".into(), "".into()).unwrap();
        cmd_save(&store, 1, "Hello".into(), "Hello World".into()).unwrap();
        let note = cmd_load(&store, 1).unwrap();
        assert_eq!(note.content, "Hello World");
    }

    // US6：新建立即显示
    #[test]
    fn us6_create_appears_in_list() {
        let store = NoteStore::default();
        cmd_save(&store, 1, "笔记".into(), "".into()).unwrap();
        let list = cmd_list(&store).unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].title, "笔记");
    }

    // US7：多笔记互不干扰
    #[test]
    fn us7_notes_independent() {
        let store = NoteStore::default();
        cmd_save(&store, 1, "A".into(), "A内容".into()).unwrap();
        cmd_save(&store, 2, "B".into(), "B内容".into()).unwrap();
        assert_eq!(cmd_load(&store, 1).unwrap().content, "A内容");
        assert_eq!(cmd_load(&store, 2).unwrap().content, "B内容");
    }

    // US8：空 store 返回空列表
    #[test]
    fn us8_empty_store() {
        let store = NoteStore::default();
        assert_eq!(cmd_list(&store).unwrap().len(), 0);
    }

    // US9：连续新建
    #[test]
    fn us9_sequential_create() {
        let store = NoteStore::default();
        for i in 1..=10 {
            cmd_save(&store, i, format!("笔记{}", i), "".into()).unwrap();
        }
        assert_eq!(cmd_list(&store).unwrap().len(), 10);
    }

    // US10：加载不存在的笔记
    #[test]
    fn us10_load_nonexistent() {
        let store = NoteStore::default();
        assert!(cmd_load(&store, 999).is_err());
    }
}
