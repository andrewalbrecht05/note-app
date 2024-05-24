pub fn is_password_valid(password: &str) -> bool {
    password.trim().len() >= 5
}

pub fn is_username_valid(username: &str) -> bool {
    username.trim().len() >= 5
}
