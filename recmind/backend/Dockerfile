# ---- Base image with Conda ----
FROM continuumio/miniconda3:latest

# Set working directory
WORKDIR /app

# Create conda environment
RUN conda create -n recmind python=3.10 -y

# Use bash for conda
SHELL ["bash", "-c"]

# Activate env and install core ML deps via conda-forge
RUN source activate recmind && \
    conda install -c conda-forge -y \
        lightfm \
        numpy \
        scipy \
        scikit-learn \
        pandas \
        pyarrow \
        faiss-cpu \
        pymongo && \
    conda clean -afy

# Copy requirements.txt (pip-only deps)
COPY requirements.txt /app/requirements.txt

# Install pip deps inside conda env
RUN source activate recmind && \
    pip install --upgrade pip && \
    pip install --no-cache-dir \
        fastapi \
        uvicorn[standard] \
        httpx \
        requests \
        python-dotenv \
        pydantic-settings \
        sqlmodel \
        sentence-transformers \
        google-api-python-client \
        youtube-transcript-api \
        pytest

# Copy backend code
COPY backend /app/backend

# Make backend importable
ENV PYTHONPATH=/app

# Activate env by default
ENV PATH=/opt/conda/envs/recmind/bin:$PATH

EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
