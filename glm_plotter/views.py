"""
JAC - jdechalendar@stanford.edu
"""
from glm_plotter import app

from flask import Flask, render_template, request, session, jsonify
import os
import json
from . import GLMparser
from . import controllers


def get_glm_file_name(session):
    return session['glm_name'] if 'glm_name' in session else None


@app.route("/", methods=['GET', 'POST'])
def index():
    print(f'{request.method} /')
    # print(session)

    resp = controllers.renderMain(
        request.method, request.files, get_glm_file_name(session))
    if 'glm_name' in resp:
        session.clear()
        session['glm_name'] = resp['glm_name']

    return render_template("index.html")


@app.route("/data", methods=['GET', 'POST'])
def data():
    print(f'{request.method}  /data')
    # print(session)
    resp = controllers.getGraphata(
        get_glm_file_name(session))
    return jsonify(resp)
