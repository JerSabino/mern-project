## About

This repo contains the code for the backend API of TaskIt. 

It is required for communication with the MongoDB database and for CRUD operations concerning the tasks (named notes in this repo) and users.

## How to Run locally

If you wish to run the [TaskIt]https://github.com/JerSabino/taskit() app locally, you would first need to fork this repo and run the backend, after which you can start the frontend to use.

After forking, run `npm install` in the project directory to install dependencies.

Once dependencies are installed, you would need to include a `.env` file in the project directory containing the following:

```
NODE_ENV=development
DATABASE_URI=<URI to connect to your MongoDB database>
ACCESS_TOKEN_SECRET=<access token for a user in the database>
REFRESH_TOKEN_SECRET=<refresh token for a user in the database>
```
After this is done, you can run the backend with `npm run dev`, you would need to leave this running if you were to run the frontend.

## Contact

If you have any questions regarding the project, or how to run it, you can reach me via my email!

Jeremiah Sabino - jer.lsabino@gmail.com