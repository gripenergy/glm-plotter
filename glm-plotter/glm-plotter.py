"""
JAC - jdechalendar@stanford.edu
"""
from flask import Flask, render_template, request, session, jsonify
import os
import json
import GLMparser
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/", methods=['GET', 'POST'])
def index():
    print(session)
    #glmFile = None
    #csvFile = None
    #fixedNodesJSON = None
    #graphJSON = ''
    if request.method == 'POST':
        if (('fixedNodes' in request.files) and request.files['fixedNodes']
            and (request.files['fixedNodes'].filename
                 .rsplit('.', 1)[1] == 'csv')):
            print(f'Reading the csv file: {request.files["fixedNodes"].filename}')
            session['csv'] = 1
            fullfilename = os.path.join(
                app.config['UPLOAD_FOLDER'], "curr.csv")
            request.files['fixedNodes'].save(fullfilename)

            csvFile = os.path.join(app.config['UPLOAD_FOLDER'], "curr.csv")
            if 'csv' in session and session['csv'] and os.path.isfile(csvFile):
                fixedNodesJSON = parseFixedNodes(csvFile)
            else:
                fixedNodesJSON = '{"names":[], "x":[], "y":[]}'
            glm_name = ''

        if (('glm_file' in request.files) and request.files['glm_file']
            and (request.files['glm_file'].filename
                 .rsplit('.', 1)[1] == 'glm')):
            print(f'Reading the glm file: {request.files["glm_file"].filename}')
            session.clear()
            session['glm_name'] = request.files['glm_file'].filename
            fullfilename = os.path.join(
                app.config['UPLOAD_FOLDER'], "curr.glm")
            request.files['glm_file'].save(fullfilename)

            glmFile = os.path.join(app.config['UPLOAD_FOLDER'], "curr.glm")
            if os.path.isfile(glmFile):
                objs, modules, commands = GLMparser.readGLM(glmFile)
                graphJSON = GLMparser.createD3JSON(objs)
            else:
                graphJSON = '{"nodes":[],"links":[]}'
            if 'glm_name' in session:
                glm_name = session['glm_name']
            else:
                glm_name = ''
            fixedNodesJSON = '{"names":[], "x":[], "y":[]}'

        JSONstr = '{"file":"' + glm_name + '","graph":' + \
            graphJSON + ',"fixedNodes":' + fixedNodesJSON + '}'
        session['json_string'] = JSONstr

    return render_template("index.html")


@app.route("/data")
def data():
    # print(session)
    """     glmFile = os.path.join(app.config['UPLOAD_FOLDER'], "curr.glm")
    csvFile = os.path.join(app.config['UPLOAD_FOLDER'], "curr.csv")
    if 'csv' in session and session['csv'] and os.path.isfile(csvFile):
        fixedNodesJSON = parseFixedNodes(csvFile)
    else:
        fixedNodesJSON = '{"names":[], "x":[], "y":[]}'
    if os.path.isfile(glmFile):
        objs, modules, commands = GLMparser.readGLM(glmFile)
        graphJSON = GLMparser.createD3JSON(objs)
    else:
        graphJSON = '{"nodes":[],"links":[]}'
    if 'glm_name' in session:
        glm_name = session['glm_name']
    else:
        glm_name = ''
    JSONstr = '{"file":"' + glm_name + '","graph":' + \
        graphJSON + ',"fixedNodes":' + fixedNodesJSON + '}'
    return JSONstr
    """
    if ('json_string' in session and session['json_string']):
        return session['json_string']

    fixedNodesJSON = '{"names":[], "x":[], "y":[]}'
    graphJSON = '{"nodes":[],"links":[]}'
    glm_name = ''
    JSONstr = '{"file":"' + glm_name + '","graph":' + \
        graphJSON + ',"fixedNodes":' + fixedNodesJSON + '}'
    return jsonify(JSONstr)


app.config['UPLOAD_FOLDER'] = 'uploads'


def parseFixedNodes(nodesFile):
    with open(nodesFile) as fr:
        lines = fr.readlines()
    names = []
    x = []
    y = []
    for line in lines:
        bla = line.split(',')
        if len(bla) == 3:
            names.append(bla[0])
            x.append(float(bla[1]))
            y.append(float(bla[2]))

    return json.dumps({'names': names, 'x': x, 'y': y})


if __name__ == "__main__":
    app.secret_key = 'B0er23j/4yX R~XHH!jmN]LWX/,?Rh'
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
