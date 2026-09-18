"""Deploy Ember analytics to Modal (HTTPS).

  cd server
  modal deploy modal_app.py

Portal: https://<workspace>--ember-analytics-analytics-server.modal.run/portal
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

import modal

APP_NAME = "ember-analytics"
ROOT = Path(__file__).resolve().parent

image = (
    modal.Image.debian_slim(python_version="3.12")
    .add_local_dir(str(ROOT), remote_path="/app/server")
)

volume = modal.Volume.from_name("ember-analytics-data", create_if_missing=True)

app = modal.App(APP_NAME)


@app.function(
    image=image,
    volumes={"/app/server/data": volume},
    timeout=86400,
)
@modal.web_server(8787, startup_timeout=120, label="analytics-server")
def analytics_server() -> None:
    os.environ["PORT"] = "8787"
    os.environ.setdefault("PUBLIC_SITE_URL", "https://lostecho37.github.io/cook-guide/")
    os.environ.setdefault(
        "CORS_ORIGIN",
        "https://lostecho37.github.io,http://127.0.0.1:8787,http://localhost:8787",
    )
    os.environ.setdefault("ADMIN_PASSWORD", "change-me-now")
    os.environ.setdefault("SESSION_SECRET", os.environ.get("MODAL_TASK_SECRET", "modal-dev-secret"))
    os.environ["DB_PATH"] = "/app/server/data/analytics.sqlite"
    subprocess.Popen(["python3", "app.py"], cwd="/app/server")
