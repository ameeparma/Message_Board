from flask import Flask
from .models import db
from .routes import bp as routes_bp

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///posts.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "change-this-key"

    db.init_app(app)
    app.register_blueprint(routes_bp)

    return app