use serde::{Deserialize, Serialize};
use tauri::Builder;

#[derive(Serialize, Deserialize)]
pub struct Note {
    pub id: u32,
    pub title: String,
    pub content: String,
}

#[tauri::command]
fn save_note(id: u32, title: String, _content: String) -> Result<(), String> {
    println!("保存笔记: id={}, title={}", id, title);
    Ok(())
}

#[tauri::command]
fn load_note(id: u32) -> Result<Note, String> {
    Ok(Note {
        id,
        title: "测试笔记".into(),
        content: "这是测试内容".into(),
    })
}

pub fn run() {
    Builder::default()
        .invoke_handler(tauri::generate_handler![save_note, load_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_save_note_returns_ok() {
        let result = save_note(1, "标题".into(), "内容".into());
        assert!(result.is_ok());
    }

    #[test]
    fn test_load_note_returns_note() {
        let note = load_note(1).unwrap();
        assert_eq!(note.id, 1);
        assert_eq!(note.title, "测试笔记");
        assert_eq!(note.content, "这是测试内容");
    }

    #[test]
    fn test_note_serialize() {
        let note = Note {
            id: 1,
            title: "标题".into(),
            content: "内容".into(),
        };
        let json = serde_json::to_string(&note).unwrap();
        assert!(json.contains("\"id\":1"));
    }

    #[test]
    fn test_note_deserialize() {
        let json = r#"{"id":2,"title":"t","content":"c"}"#;
        let note: Note = serde_json::from_str(json).unwrap();
        assert_eq!(note.id, 2);
    }
}
