from app.main import create_app

app = create_app()

if __name__ == "__main__":
    # Required by Render: use host=0.0.0.0 and port=10000
    app.run(host="0.0.0.0", port=10000)