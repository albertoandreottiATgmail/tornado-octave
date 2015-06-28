import tornado
import oct2py
import os
from oct2py import octave

class DigitHandler(tornado.websocket.WebSocketHandler):

    def post(self):
        array = self.request.body[self.request.body.index('[') + 1: self.request.body.index(']')].split(',')
        octave.addpath(os.path.abspath('.') + '/octave')
        octave.savepath()
        oc = oct2py.Oct2Py()
        oc.predictDigit(array)
        self.write('pred = ' + str(int(oc.predictDigit(array))))
        
    


        
