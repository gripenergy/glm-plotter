from glm_plotter import GLMparser

glmFile = '../../example/IEEE123.glm'
objs, modules, commands = GLMparser.readGLM(glmFile)
graphJSON = GLMparser.createD3JSON(objs)

print(graphJSON)
