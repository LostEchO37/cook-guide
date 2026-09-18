FROM python:3.12-slim
WORKDIR /app
COPY app.py .
RUN mkdir -p data
ENV PORT=8787
ENV PUBLIC_SITE_URL=https://lostecho37.github.io/cook-guide/
ENV CORS_ORIGIN=https://lostecho37.github.io
EXPOSE 8787
CMD ["python3", "app.py"]
