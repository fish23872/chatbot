FROM python:3.9-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod -R a+rwx /app
CMD ["rasa", "run", "--enable-api", "--debug"]