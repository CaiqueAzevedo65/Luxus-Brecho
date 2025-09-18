from flask import jsonify, current_app
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, OperationFailure

def check_health():
    mongo_status = "UP"
    status_code = 200

    if not hasattr(current_app, "mongo") or current_app.mongo is None:
        mongo_status = "DOWN"
        status_code = 503
    else:
        try:
            current_app.mongo.admin.command("ping")
        except (ConnectionFailure, ServerSelectionTimeoutError, OperationFailure):
            mongo_status = "DOWN"
            status_code = 503

    return jsonify(api_status="UP", database_status=mongo_status), status_code
