import numpy as np

KEYS = [
    "gpu_util", "power_w", "temp_c", "pcie_tx_gbps", "pcie_rx_gbps",
    "kernel_launches_s", "kernel_entropy", "warp_occupancy",
    "tensor_core_util", "l2_hit_ratio", "fp16_frac", "fp32_frac",
    "rps", "inter_arrival_cv", "batch_size",
]


def to_vector(sample):
    return np.array([sample[k] for k in KEYS], dtype=np.float32)


def fit_scaler(samples):
    X = np.stack([to_vector(s) for s in samples])
    return X.mean(axis=0), X.std(axis=0) + 1e-8


def normalize(sample, scaler):
    mean, std = scaler
    return (to_vector(sample) - mean) / std
