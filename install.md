# Running this requires a python installation.

It is best to install the packages in a new environment to keep things clean. Development used python 3.5

# Installation

## To install the environment with anaconda

`conda create --name myenv --file=requirements.txt`

## To install the packages using virtualenvwrapper

`mkvirtualenv -r requirements.txt myenv`

## To install the packages locally using pip

`pip install -r requirements.txt`

## To install using Docker

- First install Docker and Docker Compose
- Execute

  `docker-compose up --build`

  or as a daemon:

  `docker-compose up --build -d`

# Run

## Activate virtual evironment (Only if using a virtual environment)

- Execute

  `activate myenv # anaconda`

  `workon my env # virtualenvwrapper`

## Run the command (Non-Docker only)

- Go the the repo on your computer

  `cd <local-path-to-repo>`

- Run app

  `python glm_plotter.py`

## Docker

- The app should already be running in the Docker container. Execute the following to see the container:

  `docker ps`
