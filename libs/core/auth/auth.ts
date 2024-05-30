export interface AuthRequest {
  username?: string;
  password?: string;
  scope?: string;
  grant_type?: GrantType;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
}

export interface AuthResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export enum GrantType {
  Password = 'password',
  ClientCredentials = 'client_credentials',
  RefreshToken = 'refresh_token'
}

export enum AllowedPriviledge {
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Search = 'search',
  ChangeStatus = 'change_status',
  ReadFull = 'read_full'
}
