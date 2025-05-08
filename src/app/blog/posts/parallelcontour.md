---
<<<<<<< HEAD
title: "Parallel Contour Detection with CUDA/MPI"
=======
title: "Parallel Contour Detection"
>>>>>>> 1fdb8a353f0d224c427cbbae00a93f22e2a19a16
date: "2025-04-20"
tag:   "project"
---

This is a C implementation of a high-performance edge detection pipeline, built from scratch and desgined for large-scale batch image processing.

It uses a hybrid approach, with **MPI** used to run the algorithm across multi-GPU clusters, and **CUDA** within each GPU to split work across hundreds of thousands of threads. It also implements **MPI I/O** for parallelized concurrent file writes to shared binary files.

The primary computer vision pipeline is implemented with CUDA kernels:

- Greyscaling and Gaussian blur
- Gradient computation
- Non-maximum suppression
- Thresholding
- Edge extraction

Strong and weak scaling tests were performed for the algorithm runtime and file write, and in general indicate strong parallel performance on large multi-GPU clusters running on NVIDIA hardware.

*This project is designed to run on NVIDIA GPUs and with IBM Spectrum MPI*, though it would likely work with other CPUs.

<<<<<<< HEAD
[<ins>View code on GitHub</ins>](https://github.com/jun-simons/ParallelContourDetection)
=======
[<ins>View code on GitHub</ins>](https://github.com/jun-simons/ParallelContourDetection)
>>>>>>> 1fdb8a353f0d224c427cbbae00a93f22e2a19a16
