# Use the official Python slim image for a smaller footprint
FROM python:3.10-slim

# Set environment variables to prevent Python from writing .pyc files
# and to ensure stdout and stderr are unbuffered
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install the Python dependencies
# We use --no-cache-dir to keep the image size small
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files to the working directory
COPY . .

# Expose port 8000 for the FastAPI server
EXPOSE 8000

# Command to run the FastAPI application using Uvicorn
CMD ["uvicorn", "ml_prj:app", "--host", "0.0.0.0", "--port", "8000"]
