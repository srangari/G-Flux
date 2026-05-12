import random
import math
import time


def benign():
    return {
        "gpu_util":           random.gauss(72, 8),
        "power_w":            random.gauss(250, 12),
        "temp_c":             random.gauss(62, 3),
        "pcie_tx_gbps":       random.gauss(4.0, 0.4),
        "pcie_rx_gbps":       random.gauss(3.8, 0.4),
        "kernel_launches_s":  random.gauss(420, 30),
        "kernel_entropy":     random.gauss(1.2, 0.2),
        "warp_occupancy":     random.gauss(0.82, 0.04),
        "tensor_core_util":   random.gauss(0.78, 0.05),
        "l2_hit_ratio":       random.gauss(0.74, 0.05),
        "fp16_frac":          random.gauss(0.58, 0.04),
        "fp32_frac":          random.gauss(0.22, 0.03),
        "rps":                random.gauss(45, 15),
        "inter_arrival_cv":   random.gauss(0.55, 0.15),
        "batch_size":         random.gauss(8.5, 3.0),
    }


def snooping():
    # Inference-level signals look NORMAL (attacker isn't querying the API)
    # Hardware signals are perturbed by a co-tenant spy process on the same GPU
    return {
        "gpu_util":           random.gauss(72, 8),        # normal — victim inference running fine
        "power_w":            random.gauss(275, 18),       # slightly elevated — spy kernels consuming power
        "temp_c":             random.gauss(66, 4),         # slightly warmer — extra SM activity
        "pcie_tx_gbps":       random.gauss(7.2, 1.2),      # HIGH — spy exfiltrating data off-GPU
        "pcie_rx_gbps":       random.gauss(6.8, 1.2),      # HIGH — spy reading GPU memory over PCIe
        "kernel_launches_s":  random.gauss(620, 80),       # elevated — spy launching its own kernels
        "kernel_entropy":     random.gauss(1.9, 0.3),      # slightly higher — spy kernels mix in
        "warp_occupancy":     random.gauss(0.65, 0.08),    # degraded — spy stealing SMs
        "tensor_core_util":   random.gauss(0.71, 0.06),    # slightly degraded
        "l2_hit_ratio":       random.gauss(0.45, 0.08),    # LOW — spy evicting victim's cache lines
        "fp16_frac":          random.gauss(0.57, 0.04),    # normal — victim's compute unchanged
        "fp32_frac":          random.gauss(0.23, 0.03),    # normal
        "rps":                random.gauss(45, 15),        # normal — API traffic looks legit
        "inter_arrival_cv":   random.gauss(0.53, 0.14),    # normal — no unusual query patterns
        "batch_size":         random.gauss(8.3, 3.0),      # normal
    }


def extraction():
    osc = 25 * math.sin(time.time())
    return {
        "gpu_util":           random.gauss(65, 18),
        "power_w":            random.gauss(270 + osc, 30),
        "temp_c":             random.gauss(67, 6),
        "pcie_tx_gbps":       random.gauss(5.5, 1.5),
        "pcie_rx_gbps":       random.gauss(5.2, 1.5),
        "kernel_launches_s":  random.gauss(680, 120),
        "kernel_entropy":     random.gauss(2.8, 0.4),
        "warp_occupancy":     random.gauss(0.62, 0.12),
        "tensor_core_util":   random.gauss(0.45, 0.15),
        "l2_hit_ratio":       random.gauss(0.48, 0.12),
        "fp16_frac":          random.gauss(0.35, 0.10),
        "fp32_frac":          random.gauss(0.38, 0.09),
        "rps":                random.gauss(120, 40),
        "inter_arrival_cv":   random.gauss(0.08, 0.04),
        "batch_size":         random.gauss(1.8, 0.5),
    }
def timing_side_channel():
    # Attacker measures inference latency to infer model architecture
    return {
        "gpu_util":           random.gauss(74, 6),
        "power_w":            random.gauss(260, 10),
        "temp_c":             random.gauss(64, 3),
        "pcie_tx_gbps":       random.gauss(8.4, 1.0),
        "pcie_rx_gbps":       random.gauss(7.9, 1.0),
        "kernel_launches_s":  random.gauss(580, 60),
        "kernel_entropy":     random.gauss(2.2, 0.3),
        "warp_occupancy":     random.gauss(0.69, 0.07),
        "tensor_core_util":   random.gauss(0.52, 0.10),
        "l2_hit_ratio":       random.gauss(0.41, 0.09),
        "fp16_frac":          random.gauss(0.36, 0.08),
        "fp32_frac":          random.gauss(0.40, 0.07),
        "rps":                random.gauss(310, 60),   # HIGH — repeated timed queries
        "inter_arrival_cv":   random.gauss(0.03, 0.01), # very regular — clock-driven
        "batch_size":         random.gauss(1.0, 0.2),  # always batch=1 for timing
    }

def membership_inference():
    # Attacker probes if specific data was in training set
    return {
        "gpu_util":           random.gauss(68, 7),
        "power_w":            random.gauss(245, 12),
        "temp_c":             random.gauss(61, 3),
        "pcie_tx_gbps":       random.gauss(5.8, 0.8),
        "pcie_rx_gbps":       random.gauss(5.4, 0.8),
        "kernel_launches_s":  random.gauss(510, 50),
        "kernel_entropy":     random.gauss(2.4, 0.3),
        "warp_occupancy":     random.gauss(0.71, 0.06),
        "tensor_core_util":   random.gauss(0.48, 0.09),
        "l2_hit_ratio":       random.gauss(0.44, 0.08),
        "fp16_frac":          random.gauss(0.37, 0.07),
        "fp32_frac":          random.gauss(0.39, 0.06),
        "rps":                random.gauss(210, 50),   # HIGH — many probe queries
        "inter_arrival_cv":   random.gauss(0.06, 0.02),
        "batch_size":         random.gauss(1.2, 0.3),  # small batches
    }

def model_inversion():
    # Attacker reconstructs training data from model outputs
    return {
        "gpu_util":           random.gauss(78, 9),
        "power_w":            random.gauss(285, 20),
        "temp_c":             random.gauss(69, 4),
        "pcie_tx_gbps":       random.gauss(9.1, 1.3),
        "pcie_rx_gbps":       random.gauss(8.6, 1.3),
        "kernel_launches_s":  random.gauss(720, 90),
        "kernel_entropy":     random.gauss(3.1, 0.4),  # HIGH — complex kernel mix
        "warp_occupancy":     random.gauss(0.58, 0.10),
        "tensor_core_util":   random.gauss(0.41, 0.12),
        "l2_hit_ratio":       random.gauss(0.38, 0.10),
        "fp16_frac":          random.gauss(0.33, 0.09),
        "fp32_frac":          random.gauss(0.42, 0.08),
        "rps":                random.gauss(95, 30),
        "inter_arrival_cv":   random.gauss(0.12, 0.05),
        "batch_size":         random.gauss(2.4, 0.8),
    }