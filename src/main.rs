use axum::Router;
use axum::routing::get;
use dotenv::dotenv;
use log::info;
use rand::random;
use tower_http::cors::{Any, CorsLayer};

async fn get_number() -> String {
    info!("We are in /get_number endpoint!");
    random::<i32>().to_string()
}
#[tokio::main]
async fn main() {
    dotenv().ok();
    pretty_env_logger::init();

    let cors = CorsLayer::new().allow_origin(Any);
    let app = Router::new()
        .route("/get_number", get(get_number))
        .layer(cors);
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap();

    info!("Server has started successfully!");

    axum::serve(listener, app).await.unwrap();
}
