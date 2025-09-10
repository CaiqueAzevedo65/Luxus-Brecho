from flask import jsonify, current_app

def check_health():
    """Endpoint de health check com validação do banco."""
    try:
        db_status = "fail"
        if hasattr(current_app, "db") and current_app.db is not None:
            try:
                _ = current_app.db.list_collection_names()
                db_status = "ok"
            except Exception:
                db_status = "fail"

        status = "ok" if db_status == "ok" else "error"
        return jsonify({"status": status, "db": db_status}), 200 if status == "ok" else 500
    except Exception:
        return jsonify({"status": "error", "db": "fail"}), 500
