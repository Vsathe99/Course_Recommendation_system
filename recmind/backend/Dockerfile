# ---- Base image with Conda ----
FROM continuumio/miniconda3:latest

# Use bash for conda
SHELL ["bash", "-c"]

# Set working directory
WORKDIR /app

# Create conda environment
RUN conda create -n recmind python=3.10 -y

# Activate env and install ML deps
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

# Copy pip requirements (must be inside backend/)
COPY requirements.txt .

# Install pip deps
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

# Copy backend source code (CURRENT CONTEXT)
COPY . .

# Make backend importable
ENV PYTHONPATH=/app

# Auto-activate conda env
ENV PATH=/opt/conda/envs/recmind/bin:$PATH

EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
