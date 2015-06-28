#python 

import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web


from handlers.wshandler import DigitHandler 
#from handlers.lochandler import TraceHandler
#from handlers.confhandler import ConfigHandler

 
class Application(tornado.web.Application):
    def __init__(self):
     
        handlers = [
            (r'/digit', DigitHandler),
            (r'/(.*)', tornado.web.StaticFileHandler, {'path': 'html/'})
        ]
        
        settings = {
             'template_path': 'templates',
             'static_path': 'static'
        }

        tornado.web.Application.__init__(self, handlers, **settings)
    
if __name__ == '__main__':
    #tornado.options.parse_command_line()
    app = Application()
    print 'Server starting . . . . '
    server = tornado.httpserver.HTTPServer(app, no_keep_alive = True)
    server.listen(8000)
    tornado.ioloop.IOLoop.instance().start()
 
