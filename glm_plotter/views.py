"""
JAC - jdechalendar@stanford.edu
"""
from glm_plotter import app

from flask import Flask, render_template, request, session, jsonify
import os
import json
from . import GLMparser
from . import controllers


@app.route("/", methods=['GET', 'POST'])
def index():
    print(f'{request.method} {request.path}')
    # print(session)

    resp = controllers.renderMain(
        request.method, request.files, controllers.get_glm_file_name(session))
    if 'glm_name' in resp:
        session.clear()
        print(f'Setting GLM name in session: {resp["glm_name"]}')
        session['glm_name'] = resp['glm_name']

    return render_template("index.html")


@app.route("/data", methods=['GET', 'POST'])
def data():
    print(f'{request.method} {request.path}')
    # print(session)
    resp = controllers.getGraphData(glm_name=controllers.get_glm_file_name(
        session), fixed_nodes_json_file=controllers.get_fixed_nodes_json_file(), graph_json_file=controllers.get_graph_json_file(), graph_json=None)
    return jsonify(resp)
