use std::sync::Arc;

use argon2::{password_hash::SaltString, Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use axum::{debug_handler, extract::{State, Json, Extension}, http::{header, Response, StatusCode}, response::IntoResponse};
use axum::extract::Path;
use axum_extra::extract::cookie::{Cookie, SameSite};
use email_address::EmailAddress;
use jsonwebtoken::{encode, EncodingKey, Header};
use rand_core::OsRng;
use serde_json::{json, Value};
use sqlx::{Postgres, query_as, QueryBuilder};
use uuid::Uuid;

use crate::{
    model::*,
    AppState,
    response::{FilteredUser, filter_user_record},
    utils::{is_password_valid, is_username_valid},
};

pub async fn register_user_handler(
    State(data): State<Arc<AppState>>,
    Json(body): Json<RegisterUserSchema>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let user_exists: Option<bool> =
        sqlx::query_scalar("SELECT EXISTS( SELECT 1 FROM users WHERE email = $1)")
            .bind(body.email.trim().to_string().to_ascii_lowercase())
            .fetch_one(&data.db)
            .await
            .map_err(|err| {
                let error_response = json!({
                   "status": "fail",
                   "message": format!("Database error: {}" ,err),
               });
                (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
            })?;

    if let Some(exists) = user_exists {
        if exists {
            let error_response = json!({
                "status": "fail",
                "message": "User with that email already exists",
            });
            return Err((StatusCode::CONFLICT, Json(error_response)));
        }
    }

    if !EmailAddress::is_valid(&body.email.trim().to_ascii_lowercase()) {
        let error_response = json!({
            "status": "fail",
            "message": "User's email address is not valid"
        });
        return Err((StatusCode::BAD_REQUEST, Json(error_response)));
    }

    if !is_username_valid(body.name.trim()) {
        let error_response = json!({
            "status": "fail",
            "message": "Username is not valid"
        });
        return Err((StatusCode::BAD_REQUEST, Json(error_response)));
    }

    if !is_password_valid(body.password.trim()) {
        let error_response = json!({
            "status": "fail",
            "message": "User's password is not valid"
        });
        return Err((StatusCode::BAD_REQUEST, Json(error_response)));
    }

    let salt = SaltString::generate(&mut OsRng);
    let hashed_password = Argon2::default()
        .hash_password(body.password.trim().as_bytes(), &salt)
        .map_err(|e| {
            let error_response = json!({
                "status": "fail",
                "message": format!("Error while hashing password: {}", e),
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        }).map(|hash| hash.to_string())?;

    let user = sqlx::query_as!(
        User,
        "INSERT INTO users (name,email,password) VALUES ($1, $2, $3) RETURNING *",
        body.name.trim().to_string(),
        body.email.trim().to_string().to_ascii_lowercase(),
        hashed_password
    )
        .fetch_one(&data.db)
        .await
        .map_err(|e| {
            let error_response = json!({
            "status": "fail",
            "message": format!("Database error: {}", e),
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    let user_response = json!({"status": "success","data": serde_json::json!({
        "user": filter_user_record(&user)
    })});

    Ok(Json(user_response))
}

pub async fn login_user_handler(
    State(data): State<Arc<AppState>>,
    Json(body): Json<LoginUserSchema>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let user = query_as!(
        User,
        "SELECT * FROM users WHERE name = $1",
        body.name.trim().to_ascii_lowercase()
    ).fetch_optional(&data.db)
        .await
        .map_err(|err| {
            let error_response = json!({
                "status": "fail",
                "message": format!("Database error: {}", err),
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?
        .ok_or_else(|| {
            let error_response = json!({
                "status": "fail",
                "message": "Invalid username or password",
            });
            (StatusCode::BAD_REQUEST, Json(error_response))
        })?;

    let is_valid = match PasswordHash::new(&user.password) {
        Ok(parsed_hash) => Argon2::default().verify_password(body.password.as_bytes(), &parsed_hash)
            .map_or(false, |()| true),
        Err(_) => false
    };

    if !is_valid {
        let error_response = json!({
            "status": "fail",
            "message": "Invalid name or password"
        });
        return Err((StatusCode::BAD_REQUEST, Json(error_response)));
    }

    let now = chrono::Utc::now();
    let iat = now.timestamp() as usize;
    let exp = (now + chrono::Duration::minutes(60)).timestamp() as usize;
    let claims: TokenClaims = TokenClaims {
        sub: user.id.to_string(),
        exp,
        iat,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(data.env.jwt_secret.as_ref()),
    )
        .unwrap();

    let cookie = Cookie::build(("token", token.clone()))
        .path("/")
        .max_age(time::Duration::hours(1))
        .same_site(SameSite::Lax)
        .http_only(true);

    let mut response = Response::new(json!({
        "status": "success",
        "token": token
    }).to_string());
    response
        .headers_mut()
        .insert(header::SET_COOKIE, cookie.to_string().parse().unwrap());
    Ok(response)
}

pub async fn logout_handler() -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let cookie = Cookie::build(("token", ""))
        .path("/")
        .max_age(time::Duration::hours(-1))
        .same_site(SameSite::Lax)
        .http_only(true);

    let mut response = Response::new(json!({"status": "success"}).to_string());
    response
        .headers_mut()
        .insert(header::SET_COOKIE, cookie.to_string().parse().unwrap());
    Ok(response)
}

pub async fn get_me_handler(
    Extension(user): Extension<FilteredUser>
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let json_response = json!({
        "status": "success",
        "data": {
            "user": &user,
        }
    });
    Ok(Json(json_response))
}

#[debug_handler]
pub async fn create_note_handler(
    State(data): State<Arc<AppState>>,
    Extension(user): Extension<FilteredUser>,
    Json(body): Json<CreateNoteSchema>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    /*if body.title.trim().is_empty() {
        let error_response = json!({
            "status": "fail",
            "message": "Title can't be blank"
        });
        return Err((StatusCode::BAD_REQUEST, Json(error_response)));
    }
    if body.text.trim().is_empty() {
        let error_response = json!({
            "status": "fail",
            "message": "Text can't be blank"
        });
        return Err((StatusCode::BAD_REQUEST, Json(error_response)));
    }*/
    let note = query_as!(
        Note,
        "INSERT INTO notes (author_id,author_name,title,text) VALUES ($1, $2, $3, $4) RETURNING *",
        Uuid::parse_str(&user.id).unwrap(),
        user.name,
        body.title,
        body.text,
    )
        .fetch_one(&data.db)
        .await
        .map_err(|e| {
            let error_response = json!({
                "status": "fail",
                "message": format!("Database error: {}", e),
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    let note_response = json!({
        "status": "success",
        "data": {
            "note": note,
        },
    });
    Ok(Json(note_response))
}

pub async fn get_notes_handler(
    State(data): State<Arc<AppState>>,
    Extension(user): Extension<FilteredUser>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let notes = query_as!(
        Note,
        "SELECT * FROM notes WHERE author_id = $1 ORDER BY updated_at DESC",
        Uuid::parse_str(&user.id).unwrap(),
    )
        .fetch_all(&data.db)
        .await
        .map_err(|e| {
            let error_response = json!({
                "status": "fail",
                "message": format!("Database error: {}", e),
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    let note_response = json!({
        "status": "success",
        "data": {
            "note": notes,
        },
    });
    Ok(Json(note_response))
}

pub async fn get_note_handler(
    State(data): State<Arc<AppState>>,
    Extension(user): Extension<FilteredUser>,
    Path(note_id): Path<Uuid>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let note = query_as!(
        Note,
        "SELECT * FROM notes WHERE author_id = $1 AND id = $2",
        Uuid::parse_str(&user.id).unwrap(),
        note_id
    )
        .fetch_one(&data.db)
        .await
        .map_err(|e| {
            let error_response = json!({
                "status": "fail",
                "message": format!("Database error: {}", e),
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    let note_response = json!({
        "status": "success",
        "data": {
            "note": note,
        },
    });
    Ok(Json(note_response))
}

pub async fn update_note_handler(
    State(data): State<Arc<AppState>>,
    Path(note_id): Path<Uuid>,
    Extension(user): Extension<FilteredUser>,
    Json(body): Json<UpdateNoteSchema>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    if body.title.is_none() && body.text.is_none() {
        let error_response = json!({
            "status": "fail",
            "message": "No field provided to update"
        });
        return Err((StatusCode::BAD_REQUEST, Json(error_response)));
    }

    let mut query_str: QueryBuilder<Postgres> = QueryBuilder::new("UPDATE notes SET updated_at = NOW(), ");

    if body.title.is_some() {
        query_str.push("title = ");
        query_str.push_bind(body.title.unwrap());
        if body.text.is_some() {
            query_str.push(", ");
        }
    }

    if body.text.is_some() {
        query_str.push("text = ");
        query_str.push_bind(body.text.unwrap());
    }

    query_str.push(" WHERE id = ");
    query_str.push_bind(note_id);
    query_str.push(" AND author_id = ");
    query_str.push_bind(Uuid::parse_str(&user.id).unwrap());
    query_str.push(" RETURNING *;");

    let note: Note = query_str
        .build_query_as()
        .fetch_one(&data.db)
        .await
        .map_err(|e| {
            let error_response = json!({
                "status": "fail",
                "message": format!("Database error: {}", e),
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    let note_response = json!({
        "status": "success",
        "data": {
            "note": note,
        },
    });
    Ok(Json(note_response))
}

pub async fn delete_note_handler(
    State(data): State<Arc<AppState>>,
    Extension(user): Extension<FilteredUser>,
    Path(note_id): Path<Uuid>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let note = query_as!(
        Note,
        "DELETE FROM notes WHERE id = $1 AND author_id = $2 RETURNING *;",
        note_id,
        Uuid::parse_str(&user.id).unwrap()
    )
        .fetch_one(&data.db)
        .await
        .map_err(|e| {
            let error_response = json!({
                "status": "fail",
                "message": format!("Database error: {}", e),
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    let note_response = json!({
        "status": "success",
        "data": {
            "note": note,
        },
    });
    Ok(Json(note_response))
}

pub async fn health_checker_handler() -> impl IntoResponse {
    const MESSAGE: &str = "JWT auth test";

    let json_response = json!({
        "status": "success",
        "message": MESSAGE
    });

    Json(json_response)
}
