# Synopsis

An interactive visualization app for power system networks described in [Gridlab-D](http://www.gridlabd.org/) Model files. Back-end uses Flask and front-end uses D3's force layout.

# Example

Here is a screen shot from a visualisation of the [IEEE 123-node test feeder](https://ewh.ieee.org/soc/pes/dsacom/testfeeders/). The corresponding .glm file is in the example folder.
![Alt text](etc/ieee123_example.png?raw=true "IEEE 123 node example")

# Usage - see install.md for command-line commands

## Local or Virtual Environment

- Install python packages (version 3.5 was used for development) - see install.md.
- From the command line, change directory to the directory glm-plotter located in this repository. `cd <path-to-repo>`
- If the python packages were installed in a virtual environment, activate the virtual environment
- Run the glm_plotter.py file. `python glm_plotter.py`
- Open a browser and go to http://localhost:5000.

## Docker

- Run `docker-compose up --build`
- Open a browser and go to http://localhost:5000.

## Use as a module

- glm plotter can also be used as a module
- Execute `pip install <repo or directory>` to install it as a module.
- In your application, import the views and/or the parsing library, e.g.,
- `from glm_plotter import views`
- `from glm_plotter import GLMparser`

# Description

This app parses a .glm (GridLab-D Model) file and displays the corresponding network. The visualization uses the [D3 force layout algorithm by Mike Bostock](https://bl.ocks.org/mbostock/4062045).
Hovering over a node or link will display its class. The nodes can be dragged to locations. Once they have been dragged, they are fixed. They can be released again with a double-click.

**Available options**

- Export the position of the nodes (in the html svg component) to a csv.
- Export the position of the fixed nodes to a csv.
- Remove a prefix in the names (in some glm files there will be a common prefix that makes visualization cumbersome).
- Load a csv file (typically one you have exported as above) with positions for the nodes. Those nodes will now be fixed to the required positions.
