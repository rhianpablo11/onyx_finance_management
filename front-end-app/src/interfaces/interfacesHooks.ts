

export interface loginCredentials {
    email: string
    password: string
}


export interface LoginResponse {
    access_token: string
    token_type: string
    user_data: {
        id: string
        name: string
        email: string
    };
}


export interface ChatHistoryMessage {
  id: string | number; 
  text: string;
  sender: 'user' | 'ia';
  created_at: string;
};