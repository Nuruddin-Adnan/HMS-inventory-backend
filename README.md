

## Installation

Install with yarn

```bash
  yarn 
```

## Settings

settings.json (vs code settings)

```bash
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```
    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NODE_ENV=development`

`PORT=5000`

`DATABASE_URL=mongodb://127.0.0.1:27017/test`

`BCRYPT_SALT_ROUNDS=12`

`JWT_SECRET= 'very-secret'`

`JWT_EXPIRES_IN=1d`

`JWT_REFRESH_SECRET='very-refresh-secret'`

`JWT_REFRESH_EXPIRES_IN=365d`


## API Reference

#### user

```json
  GET api/v1/users/my-profile  see personal profile
  PATCH api/v1/users/my-profile update the profile information
  PATCH api/v1/users/${id} Admin can update the user
  GET api/v1/users/${id} Admin can see the user profile
  GET api/v1/users/ Admin can see all the users
  DELETE api/v1/users/${id} Admin can delete the user

```


#### Auth

```json
  GET api/v1/auth/login login a user
  POST api/v1/auth/signup signup a user
  POST api/v1/auth/refresh-token generate a new refresh token
```


#### Admin

```json
  POST api/v1/admins/create-admin create an admin by super_admin or another admin
  POST api/v1/admins/login login a admin
  POST api/v1/admins/refresh-token generate a new refresh token
  GET api/v1/admins/my-profile Admin cab see personal profile
  PATCH api/v1/admins/my-profile Admin can update the profile
  DELETE api/v1/admins/${id} super_admin can delete the admin
```

