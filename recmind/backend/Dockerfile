FROM continuumio/miniconda3:latest

SHELL ["bash", "-c"]

WORKDIR /app

# Create env
RUN conda create -n recmind python=3.10 -y

RUN source activate recmind && \
    conda install -c conda-forge -y \
        lightfm numpy scipy scikit-learn pandas \
        pyarrow faiss-cpu pymongo && \
    conda clean -afy

# Copy requirements
COPY requirements.txt .

RUN source activate recmind && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy BACKEND PACKAGE
COPY backend backend

# Make backend importable
ENV PYTHONPATH=/app
ENV PATH=/opt/conda/envs/recmind/bin:$PATH

EXPOSE 8000

# IMPORTANT: run as MODULE
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
