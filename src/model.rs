use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, sqlx::FromRow, Serialize, Clone)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub password: String,
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, sqlx::FromRow, Serialize, Clone)]
pub struct Note {
    pub id: Uuid,
    #[serde(rename = "authorId")]
    pub author_id: Uuid,
    #[serde(rename = "authorName")]
    pub author_name: String,
    pub title: String,
    pub text: String,
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub iat: usize,
    pub exp: usize,
}

#[derive(Debug, Deserialize)]
pub struct RegisterUserSchema {
    pub name: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginUserSchema {
    pub name: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoteSchema {
    pub title: String,
    pub text: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNoteSchema {
    pub title: Option<String>,
    pub text: Option<String>,
}
