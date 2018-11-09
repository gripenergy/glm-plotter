"""
JAC - jdechalendar@stanford.edu
"""
from glm_plotter import app
import os

if __name__ == "__main__":
    app.secret_key = 'B0er23j/4yX R~XHH!jmN]LWX/,?Rh'
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
