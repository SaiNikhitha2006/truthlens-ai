import hashlib
import io
import numpy as np
from PIL import Image
from scipy.fftpack import dct

def compute_sha256(image_bytes: bytes) -> str:
    """Computes SHA-256 cryptographic binary hash of the image bytes."""
    return hashlib.sha256(image_bytes).hexdigest()

def compute_phash(image_input) -> str:
    """
    Computes a 64-bit perceptual hash (pHash) using Discrete Cosine Transform (DCT).
    pHash is invariant to minor resizing, compression, and slight color adjustments.
    """
    try:
        if isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input))
        else:
            image = image_input

        # Convert to grayscale and resize to 32x32
        gray_image = image.convert("L").resize((32, 32), Image.Resampling.BILINEAR)
        pixels = np.array(gray_image, dtype=np.float32)

        # 2D DCT: apply 1D DCT along rows, then columns
        dct_rows = dct(pixels, axis=0, norm='ortho')
        dct_2d = dct(dct_rows, axis=1, norm='ortho')

        # Extract top-left 8x8 low frequencies (excluding DC term at [0, 0] for variance)
        dct_low_freq = dct_2d[:8, :8]
        dct_slice = dct_low_freq.flatten()[1:] # exclude 0,0

        median_val = np.median(dct_slice)
        # Compute binary hash: 1 if >= median, 0 otherwise
        bit_array = dct_low_freq.flatten() >= median_val
        
        # Convert 64 booleans into 16-hex digit string (64 bits)
        hex_str = ""
        for i in range(0, 64, 4):
            nibble = bit_array[i:i+4]
            val = sum(int(b) * (2 ** (3 - j)) for j, b in enumerate(nibble))
            hex_str += f"{val:x}"

        return hex_str
    except Exception as e:
        # Fallback to simple hash if DCT fails
        if isinstance(image_input, bytes):
            return hashlib.md5(image_input).hexdigest()[:16]
        return "0000000000000000"

def hamming_distance(hash1: str, hash2: str) -> int:
    """
    Computes Hamming Distance (number of differing bits) between two hex pHashes.
    """
    try:
        # Convert hex strings to 64-bit integers
        val1 = int(hash1, 16)
        val2 = int(hash2, 16)
        # XOR to get differing bits, then count 1s
        xor_result = val1 ^ val2
        return bin(xor_result).count("1")
    except Exception:
        # Fallback character difference
        return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))

def is_phash_match(hash1: str, hash2: str, threshold: int = 10) -> bool:
    """
    Determines if two images are perceptual near-duplicates.
    Threshold of 10 bits out of 64 typically indicates the same image with compression/resizing.
    """
    return hamming_distance(hash1, hash2) <= threshold
