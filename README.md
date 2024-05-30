# UNDP eView Clients

This project was generated using [Nx](https://nx.dev).

## Apps
Here you will find two apps, both based on Angular. 
### web-app
A standard Angular application.
### mobile-app 
An Ionic app with the aim of serving eView on both Android and iOS.

## Branch and Conventions
TBD.

## Run
Run `ng serve APP_NAME --port 4200`, where APP_NAME is the name of the app you would like to serve. 
This will start a dev server where the app will automatically reload if you change any of the source files.
Do the same for the mobile app.

## Build
Run `ng build APP_NAME` to build the project. 
The build artifacts will be stored in the `dist/` directory. 
Use the `--prod` flag for a production build.

## Running Unit Tests
Run `ng test APP_NAME` to execute the unit tests via [Jest](https://jestjs.io).
Run `nx affected:test` to execute the unit tests affected by a change.

## Running End-to-End tests
Run `ng e2e APP_NAME` to execute the end-to-end tests via [Cypress](https://www.cypress.io).
Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

## Understand your workspace
Run `nx dep-graph` to see a diagram of the dependencies of your projects.

## Further help
Visit the [Nx Documentation](https://nx.dev/angular) to learn more.
