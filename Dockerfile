# Python WebSocket-Server für Coolify
FROM python:3.11-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# Python-Abhängigkeiten installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Anwendungscode kopieren
COPY . .

# Port freigeben (Coolify verwendet automatisch PORT-Umgebungsvariable)
EXPOSE 3001

# Umgebungsvariablen setzen
ENV PYTHONUNBUFFERED=1
ENV PORT=3001

# Anwendung starten
CMD ["python", "cors-proxy.py"]
