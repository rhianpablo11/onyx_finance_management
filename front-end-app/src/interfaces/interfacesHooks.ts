

export interface loginCredentials {
    email: string
    password: string
}


export interface LoginResponse {
    access_token: string
    token_type: string
    user: {
        id: string
        name: string
        email: string
    };
}