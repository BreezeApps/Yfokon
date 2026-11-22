// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
//
// Set WEBKIT_DISABLE_DMABUF_RENDERER on Linux; provide a no-op on other platforms.
#[cfg(target_os = "linux")]
fn set_webkit_env() {
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    set_webkit_env();

    let mut builder = tauri::Builder::default().plugin(tauri_plugin_shell::init());

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(
                |_app: &tauri::AppHandle, _args, _cwd| {
                    /* println!("--- Nouvelle instance détectée ---");
                    println!("Arguments reçus par Rust : {:?}", args);

                    for arg in args {
                        println!("Examen de l'argument : {}", arg);
                        if arg.contains("yfokon://") {
                            println!("-> Protocole yfokon trouvé ! Envoi au JS...");
                            /* let _ = app.emit("deep-link-received", arg); */
                            break;
                        }
                    }
                    println!("----------------------------------"); */
                },
            ))
            .plugin(tauri_plugin_window_state::Builder::default().build());
    }

    builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
