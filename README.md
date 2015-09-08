# Orderlyst
Orderlyst

## Setting up

1. Requires the following:
    - NodeJS & npm
    - Bower
    - Gulp

  Install bower and gulp using: `npm i -g bower gulp`

2. Perform installation of npm dependencies:

    ````
    npm i
    ````

3. Perform installation of bower dependencies:

    ````
    bower install
    ````

4. Configure the application
    - `cp config/template.json config/development.json`
    - Edit `config/development.json`
    - Set `NODE_ENV` to `development` (or `production` if setting up production server)

5. Run Gulp build:

    ````
    gulp
    ````

6. Run server using either `nodemon bin/www` or `npm start`
