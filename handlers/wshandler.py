import tornado

class WSHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        self.application.alarms.register(self.callback)
        
    def on_close(self):
        self.application.alarms.unregister(self.callback)
        
    def on_message(self, message):
        pass
        
    def callback(self, message):
        self.write_message(message)


        
