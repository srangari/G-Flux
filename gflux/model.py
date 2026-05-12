import numpy as np


class Autoencoder:
    def __init__(self, dim, hidden=16, latent=8):
        self.W1 = np.random.randn(dim, hidden).astype(np.float32) * np.sqrt(2 / dim)
        self.b1 = np.zeros(hidden, np.float32)
        self.W2 = np.random.randn(hidden, latent).astype(np.float32) * np.sqrt(2 / hidden)
        self.b2 = np.zeros(latent, np.float32)
        self.W3 = np.random.randn(latent, hidden).astype(np.float32) * np.sqrt(2 / latent)
        self.b3 = np.zeros(hidden, np.float32)
        self.W4 = np.random.randn(hidden, dim).astype(np.float32) * np.sqrt(2 / hidden)
        self.b4 = np.zeros(dim, np.float32)

    def _relu(self, x):
        return np.maximum(0, x)

    def forward(self, x):
        h1 = self._relu(x @ self.W1 + self.b1)
        z  = self._relu(h1 @ self.W2 + self.b2)
        h2 = self._relu(z @ self.W3 + self.b3)
        return h2 @ self.W4 + self.b4

    def error(self, x):
        return np.mean((x - self.forward(x)) ** 2, axis=-1)

    def train(self, X, lr=0.005, epochs=80, batch_size=32):
        for _ in range(epochs):
            idx = np.random.permutation(len(X))
            for i in range(0, len(X), batch_size):
                b = X[idx[i : i + batch_size]]

                h1   = self._relu(b  @ self.W1 + self.b1)
                z    = self._relu(h1 @ self.W2 + self.b2)
                h2   = self._relu(z  @ self.W3 + self.b3)
                xhat = h2 @ self.W4 + self.b4

                d4 = np.clip(2 * (xhat - b) / b.shape[1], -1, 1)
                self.W4 -= lr * np.clip(h2.T @ d4, -1, 1);  self.b4 -= lr * d4.sum(0)
                d3 = np.clip((d4 @ self.W4.T) * (h2 > 0), -1, 1)
                self.W3 -= lr * np.clip(z.T  @ d3, -1, 1);  self.b3 -= lr * d3.sum(0)
                d2 = np.clip((d3 @ self.W3.T) * (z  > 0), -1, 1)
                self.W2 -= lr * np.clip(h1.T @ d2, -1, 1);  self.b2 -= lr * d2.sum(0)
                d1 = np.clip((d2 @ self.W2.T) * (h1 > 0), -1, 1)
                self.W1 -= lr * np.clip(b.T  @ d1, -1, 1);  self.b1 -= lr * d1.sum(0)


def build_baseline(X, hidden=16, latent=8, epochs=80, pct=97):
    model = Autoencoder(X.shape[1], hidden, latent)
    model.train(X, epochs=epochs)
    threshold = float(np.percentile(model.error(X), pct))
    return model, threshold
