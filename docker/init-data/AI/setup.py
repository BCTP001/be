import setuptools

# Read the README for the long description
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setuptools.setup(
    name="book-recommendation-ai",
    version="0.1.0",
    author="Your Name", # Replace with your name
    author_email="your.email@example.com", # Replace with your email
    description="A FastAPI application for book recommendations using sentence embeddings and FAISS.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/book-recommendation-ai", # Replace with your project's GitHub URL
    packages=setuptools.find_packages(), # Automatically find all packages in the directory
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License", # Or your preferred license
        "Operating System :: OS Independent",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Text Processing :: Linguistic",
        "Framework :: FastAPI",
    ],
    python_requires=">=3.9", # Ensure this matches your pyproject.toml
    install_requires=[
        "pandas>=2.0",
        "fastapi>=0.100",
        "uvicorn[standard]>=0.20",
        "sentence-transformers>=2.2.2",
        "torch>=1.13.0", # Sentence-transformers depends on torch
        "pyarrow>=10.0.0",
        "fastparquet>=2023.4.0",
        # Choose one FAISS version based on your hardware:
        "faiss-cpu>=1.7.0", # For CPU-only environments
        # "faiss-gpu>=1.7.0", # Uncomment this line and comment out faiss-cpu if you have an NVIDIA GPU with CUDA
    ],
    # Optional: Define extra dependencies for development, testing, etc.
    extras_require={
        "dev": [
            "pytest>=7.0",
            "flake8>=6.0",
        ],
    },
    # You might add data files here if they are not part of a package
    # package_data={
    #     'your_package_name': ['data/*.csv'],
    # },
    # include_package_data=True, # Use this if you have a MANIFEST.in or specific package_data
)
