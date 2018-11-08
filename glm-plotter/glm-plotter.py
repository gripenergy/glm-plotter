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
    print(f'{request.method} /')
    # print(session)

    csvFile = os.path.join(app.config['UPLOAD_FOLDER'], "curr.csv")
    glmFile = os.path.join(app.config['UPLOAD_FOLDER'], "curr.glm")

    glm_name = ''
    fixedNodesJSON = json.loads('{"names":[], "x":[], "y":[]}')
    graphJSON = json.loads('{"nodes":[],"links":[]}')

    if request.method == 'POST':
        if (('fixedNodes' in request.files) and request.files['fixedNodes']
            and (request.files['fixedNodes'].filename
                 .rsplit('.', 1)[1] == 'csv')):
            if 'glm_name' in session:
                glm_name = session['glm_name']
            try:
                with open('graph.json') as json_data:
                    graphJSON = json.load(json_data)
            except:
                pass

            print(f'Reading the csv file: {request.files["fixedNodes"].filename}')
            session['csv'] = 1
            fullfilename = os.path.join(
                app.config['UPLOAD_FOLDER'], "curr.csv")
            request.files['fixedNodes'].save(fullfilename)

            if os.path.isfile(csvFile):
                fixedNodesJSON = parseFixedNodes(csvFile)
                #session['fixed_nodes_json'] = fixedNodesJSON
                with open('fixed_nodes.json', 'w') as outfile:
                    print('Writing to fixed_nodes.json')
                    outfile.write(fixedNodesJSON)

        if (('glm_file' in request.files) and request.files['glm_file']
            and (request.files['glm_file'].filename
                 .rsplit('.', 1)[1] == 'glm')):
            try:
                with open('fixed_nodes.json') as json_data:
                    fixedNodesJSON = json.load(json_data)
            except:
                pass

            print('4')
            print(f'Reading the glm file: {request.files["glm_file"].filename}')
            session.clear()
            session['glm_name'] = request.files['glm_file'].filename
            fullfilename = os.path.join(
                app.config['UPLOAD_FOLDER'], "curr.glm")
            request.files['glm_file'].save(fullfilename)

            if os.path.isfile(glmFile):
                print('5')
                objs, modules, commands = GLMparser.readGLM(glmFile)
                graphJSON = GLMparser.createD3JSON(objs)
                #session['graph_json'] = graphJSON
                with open('graph.json', 'w') as outfile:
                    print(f'Writing to graph.json: {graphJSON}')
                    outfile.write(graphJSON)

    return render_template("index.html")


@app.route("/data")
def data():
    print('GET /data')
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

    csvFile = os.path.join(app.config['UPLOAD_FOLDER'], "curr.csv")
    glmFile = os.path.join(app.config['UPLOAD_FOLDER'], "curr.glm")

    glm_name = ''
    fixedNodesJSON = json.loads('{"names":[], "x":[], "y":[]}')
    graphJSON = json.loads('{"nodes":[],"links":[]}')

    try:
        with open('fixed_nodes.json') as json_data:
            fixedNodesJSON = json.load(json_data)
    except:
        pass

    try:
        with open('graph.json') as json_data:
            graphJSON = json.load(json_data)
    except:
        pass

    if 'glm_name' in session:
        glm_name = session['glm_name']

    # print(f'glm_name: {glm_name}')
    # print(f'graphJSON: {graphJSON}')
    # print(f'session: {session}')
    resp = {"file": glm_name, "graph":
            graphJSON, "fixedNodes": fixedNodesJSON}

    return jsonify(resp)


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
