mod model;
mod route;
mod config;
mod response;
mod jwt_auth;
mod handler;

use std::env;
use std::sync::Arc;
use axum::response::IntoResponse;
use axum::{Json, Router};
use axum::http::{HeaderValue, Method};
use axum::http::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use axum::routing::{get, post};
use dotenv::dotenv;
use log::info;
use rand::random;
use serde_json::json;
use sqlx::{Pool, Postgres};
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::{Any, CorsLayer};
use crate::config::Config;
use crate::handler::{login_user_handler, register_user_handler};
use crate::route::create_router;

pub struct AppState {
    db: Pool<Postgres>,
    env: Config,
}

impl AppState {
    fn new(db: Pool<Postgres>, env: Config) -> Self {
        Self {
            db,
            env,
        }
    }
}


#[tokio::main]
async fn main() {
    dotenv().ok();
    pretty_env_logger::init();
    let config = Config::init();

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to the database");

    let cors = CorsLayer::new()
        .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
        .allow_credentials(true)
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE]);

    let app_state = AppState::new(pool, config);
    let app = create_router(Arc::new(app_state))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap();

    info!("🚀 Server started successfully");

    axum::serve(listener, app).await.unwrap();
}
