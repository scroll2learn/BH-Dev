
from jupyter_server.base.handlers import JupyterHandler
import tornado
import os, json, mimetypes, asyncio

class ListFilesHandler(JupyterHandler):
    @tornado.web.authenticated
    def get(self):
        dir_path = self.get_query_argument("dirPath")
        if not os.path.isdir(dir_path):
            self.set_status(400)
            self.finish(json.dumps({"reason": "not-directory"}))
            return
        files_info = []
        for filename in os.listdir(dir_path):
            file_path = os.path.join(dir_path, filename)
            stat_info = os.stat(file_path)
            files_info.append({
                "name": filename,
                "path": file_path,
                "size": stat_info.st_size,
                "modified": stat_info.st_mtime,
                "created": stat_info.st_ctime,
                "mimeType": mimetypes.guess_type(file_path)[0],
                "isDirectory": os.path.isdir(file_path)
            })
        self.finish(json.dumps(files_info))

class StatFileHandler(JupyterHandler):
    @tornado.web.authenticated
    def get(self):
        file_path = self.get_query_argument("filePath")
        if not os.path.exists(file_path):
            self.set_status(404)
            self.finish(json.dumps({"reason": "not-found"}))
            return
        if os.path.isdir(file_path):
            self.set_status(400)
            self.finish(json.dumps({"reason": "is-directory"}))
            return
        stat_info = os.stat(file_path)
        file_stat = {
            "name": os.path.basename(file_path),
            "path": file_path,
            "size": stat_info.st_size,
            "modified": stat_info.st_mtime,
            "created": stat_info.st_ctime,
            "mimeType": mimetypes.guess_type(file_path)[0],
            "isDirectory": os.path.isdir(file_path)
        }
        self.finish(json.dumps(file_stat))

class ReadFileHandler(JupyterHandler):
    @tornado.web.authenticated
    async def get(self):
        file_path = self.get_query_argument("filePath")
        if not os.path.isfile(file_path):
            self.set_status(400)
            self.finish(json.dumps({"reason": "not-file"}))
            return
        self.set_header("Content-Type", "application/octet-stream")
        self.set_header("Content-Disposition", f'attachment; filename="{os.path.basename(file_path)}"')
        loop = asyncio.get_event_loop()
        with open(file_path, 'rb') as file:
            while True:
                chunk = await loop.run_in_executor(None, file.read, 1024*1024*10)
                if not chunk:
                    break
                self.write(chunk)
                await self.flush()
        await self.finish()

@tornado.web.stream_request_body
class WriteFileHandler(JupyterHandler):
    def initialize(self):
        self.file = None
        self.file_path = None

    async def data_received(self, chunk):
        if self.file is None:
            file_path = self.get_query_argument("filePath")
            if not file_path:
                self.set_status(400)
                self.finish(json.dumps({"reason": "file-path-not-specified"}))
                return
            self.file_path = file_path
            self.file = open(self.file_path, "wb")
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.file.write, chunk)

    @tornado.web.authenticated
    async def post(self):
        if self.file:
            self.file.close()
            self.finish(json.dumps({"status": "written", "path": self.file_path}))
        else:
            self.set_status(400)
            self.finish(json.dumps({"reason": "no-data"}))

class RemoveFileHandler(JupyterHandler):
    @tornado.web.authenticated
    async def delete(self):
        file_path = self.get_query_argument("filePath")
        if not os.path.exists(file_path):
            self.set_status(404)
            self.finish(json.dumps({"reason": "not-found"}))
            return
        os.remove(file_path)
        self.finish(json.dumps({"status": "deleted", "path": file_path}))

class PingHandler(JupyterHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish("pong")

class CWDHandler(JupyterHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"cwd": os.getcwd()}))

def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]
    base_route_pattern = base_url + "api/briefer"
    web_app.add_handlers(host_pattern, [
        (f"{base_route_pattern}/files/list", ListFilesHandler),
        (f"{base_route_pattern}/files/stat", StatFileHandler),
        (f"{base_route_pattern}/files/read", ReadFileHandler),
        (f"{base_route_pattern}/files/write", WriteFileHandler),
        (f"{base_route_pattern}/files/remove", RemoveFileHandler),
        (f"{base_route_pattern}/ping", PingHandler),
        (f"{base_route_pattern}/cwd", CWDHandler),
    ])
