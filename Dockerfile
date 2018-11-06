FROM library/python:3.7-stretch
RUN apt-get update && apt-get install -y python3
RUN apt-get install -y python3-pip
RUN apt-get install -y build-essential

COPY requirements.txt /
RUN pip3 install --trusted-host pypi.org -r /requirements.txt
# RUN pip3 install --upgrade numpy
ADD ./glm-plotter /code
WORKDIR /code

CMD ["python3", "glm-plotter.py"]



