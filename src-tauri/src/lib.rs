use tauri::Builder;

pub fn run() {
    Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
