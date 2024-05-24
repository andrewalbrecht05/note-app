use chrono::prelude::*;
use serde::Serialize;
use crate::model::User;

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Clone)]
pub struct FilteredUser {
    pub id : String,
    pub name: String,
    pub email: String,
    pub createdAt: DateTime<Utc>,
    pub updatedAt: DateTime<Utc>,
}
#[derive(Serialize, Debug)]
pub struct UserData {
    pub user: FilteredUser,
}

#[derive(Serialize, Debug)]
pub struct UserResponse {
    pub status: String,
    pub data: UserData,
}

pub fn filter_user_record(user: &User) -> FilteredUser {
    FilteredUser {
        id: user.id.to_string(),
        name: user.name.to_string(),
        email: user.email.to_string(),
        createdAt: user.created_at.unwrap(),
        updatedAt: user.updated_at.unwrap(),
    }
}