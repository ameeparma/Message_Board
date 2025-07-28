from flask import Blueprint, request, jsonify, render_template
from .models import db, Post
from datetime import datetime

bp = Blueprint("routes", __name__)

@bp.route("/")
def home():
    return render_template("index.html")

@bp.route("/api/posts", methods=["GET"])
def get_posts():
    sort = request.args.get("sort", "time")

    query = Post.query
    if sort == "votes":
        query = query.order_by(Post.votes.desc(), Post.timestamp.desc())
    else:
        query = query.order_by(Post.timestamp.desc())

    posts = query.limit(50).all()
    return jsonify([post.to_dict() for post in posts])

@bp.route("/api/posts", methods=["POST"])
def create_post():
    data = request.get_json()
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "Message is required"}), 400
    if len(message) > 280:
        return jsonify({"error": "Message too long"}), 400

    new_post = Post(content=message)
    db.session.add(new_post)
    db.session.commit()

    return jsonify(new_post.to_dict()), 201

@bp.route("/api/posts/<int:post_id>/vote", methods=["POST"])
def vote_post(post_id):
    data = request.get_json()
    direction = data.get("direction")

    post = Post.query.get_or_404(post_id)

    if direction == "up":
        post.votes += 1
    elif direction == "down":
        post.votes -= 1
    else:
        return jsonify({"error": "Invalid vote direction"}), 400

    db.session.commit()
    return jsonify(post.to_dict()), 200
