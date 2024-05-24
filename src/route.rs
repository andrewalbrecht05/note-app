use std::sync::Arc;

use axum::{
    middleware,
    Router,
    routing::{delete, get, patch, post}
};
use crate::{
    AppState,
    handler::*,
    jwt_auth::auth,
};

pub fn create_router(app_state: Arc<AppState> ) -> Router {
    Router::new()
        .route("/api/healthchecker", get(health_checker_handler))
        .route("/api/auth/login", post(login_user_handler))
        .route("/api/auth/register", post(register_user_handler))
        .route(
            "/api/auth/logout",
            get(logout_handler)
                .route_layer(middleware::from_fn_with_state(app_state.clone(), auth))
        )
        .route(
            "/api/users/me",
            get(get_me_handler)
                .route_layer(middleware::from_fn_with_state(app_state.clone(), auth)),
        )
        .route(
            "/api/notes/",
            post(create_note_handler)
                .route_layer(middleware::from_fn_with_state(app_state.clone(), auth)),
        )
        .route(
            "/api/notes/",
            get(get_notes_handler)
                .route_layer(middleware::from_fn_with_state(app_state.clone(), auth))
        )
        .route(
            "/api/notes/:note_id",
            get(get_note_handler)
                .route_layer(middleware::from_fn_with_state(app_state.clone(), auth)),
        )
        .route(
            "/api/notes/:note_id",
            patch(update_note_handler)
                .route_layer(middleware::from_fn_with_state(app_state.clone(), auth))
        )
        .route(
            "/api/notes/:note_id",
            delete(delete_note_handler)
                .route_layer(middleware::from_fn_with_state(app_state.clone(), auth))
        )
        .with_state(app_state)
}
