# app/database.py

from .models import db
from flask import Flask

def init_db(app: Flask):
    with app.app_context():
        db.create_all()