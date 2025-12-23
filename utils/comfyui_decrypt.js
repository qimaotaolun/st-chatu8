/**
 * 图片解密工具 - JavaScript 版本
 * 对应 Python 的 decrypt_auto.py
 * 默认密码: 123qwe
 * 
 * 注意：依赖全局 CryptoJS 对象（由 crypto-js.min.js 提供）
 */

/**
 * 获取字符串的指定范围
 * @param {string} input 输入字符串
 * @param {number} offset 偏移量
 * @param {number} rangeLen 范围长度
 * @returns {string}
 */
function getRange(input, offset, rangeLen = 4) {
    offset = offset % input.length;
    const doubled = input + input;
    return doubled.substring(offset, offset + rangeLen);
}

/**
 * 获取 SHA256 哈希
 * @param {string} input 输入字符串
 * @returns {string}
 */
function getSha256(input) {
    // 使用全局 CryptoJS 对象
    if (typeof CryptoJS === 'undefined') {
        throw new Error('CryptoJS is not loaded. Please ensure crypto-js.min.js is loaded first.');
    }
    return CryptoJS.SHA256(input).toString();
}

/**
 * 使用密钥打乱数组（正向）
 * @param {Array} arr 数组
 * @param {string} key 密钥
 * @returns {Array}
 */
function shuffleArr(arr, key) {
    const shaKey = getSha256(key);
    const arrLen = arr.length;
    
    for (let i = 0; i < arrLen; i++) {
        const toIndex = parseInt(getRange(shaKey, i, 8), 16) % (arrLen - i);
        [arr[i], arr[toIndex]] = [arr[toIndex], arr[i]];
    }
    
    return arr;
}

/**
 * 使用密钥打乱数组（反向，v2版本）
 * @param {Array} arr 数组
 * @param {string} key 密钥
 * @returns {Array}
 */
function shuffleArrV2(arr, key) {
    const shaKey = getSha256(key);
    const arrLen = arr.length;
    
    for (let i = 0; i < arrLen; i++) {
        const sIdx = arrLen - i - 1;
        const toIndex = parseInt(getRange(shaKey, i, 8), 16) % (arrLen - i);
        [arr[sIdx], arr[toIndex]] = [arr[toIndex], arr[sIdx]];
    }
    
    return arr;
}

/**
 * 解密图片 - 版本 1 (pixel_shuffle)
 * @param {ImageData} imageData Canvas ImageData 对象
 * @param {string} password 密码
 * @returns {ImageData}
 */
function decryptImageV1(imageData, password) {
    const width = imageData.width;
    const height = imageData.height;
    
    // 生成 x 和 y 的打乱数组
    const xArr = Array.from({ length: width }, (_, i) => i);
    shuffleArr(xArr, password);
    
    const yArr = Array.from({ length: height }, (_, i) => i);
    shuffleArr(yArr, getSha256(password));
    
    const data = new Uint8ClampedArray(imageData.data);
    
    // 反向遍历进行像素交换
    for (let x = width - 1; x >= 0; x--) {
        const _x = xArr[x];
        for (let y = height - 1; y >= 0; y--) {
            const _y = yArr[y];
            
            const idx1 = (y * width + x) * 4;
            const idx2 = (_y * width + _x) * 4;
            
            // 交换 RGBA 四个通道
            for (let c = 0; c < 4; c++) {
                [data[idx1 + c], data[idx2 + c]] = [data[idx2 + c], data[idx1 + c]];
            }
        }
    }
    
    return new ImageData(data, width, height);
}

/**
 * 解密图片 - 版本 2 (pixel_shuffle_2)
 * @param {ImageData} imageData Canvas ImageData 对象
 * @param {string} password 密码
 * @returns {ImageData}
 */
function decryptImageV2(imageData, password) {
    const width = imageData.width;
    const height = imageData.height;
    
    const xArr = Array.from({ length: width }, (_, i) => i);
    shuffleArr(xArr, password);
    
    const yArr = Array.from({ length: height }, (_, i) => i);
    shuffleArr(yArr, getSha256(password));
    
    // 转换为二维数组 [height][width][channels]
    const pixels = [];
    for (let y = 0; y < height; y++) {
        pixels[y] = [];
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            pixels[y][x] = [
                imageData.data[idx],
                imageData.data[idx + 1],
                imageData.data[idx + 2],
                imageData.data[idx + 3]
            ];
        }
    }
    
    // 转置并处理 x
    const transposed1 = [];
    for (let x = 0; x < width; x++) {
        transposed1[x] = [];
        for (let y = 0; y < height; y++) {
            transposed1[x][y] = pixels[y][x];
        }
    }
    
    for (let x = width - 1; x >= 0; x--) {
        const _x = xArr[x];
        [transposed1[x], transposed1[_x]] = [transposed1[_x], transposed1[x]];
    }
    
    // 转置回来
    const transposed2 = [];
    for (let y = 0; y < height; y++) {
        transposed2[y] = [];
        for (let x = 0; x < width; x++) {
            transposed2[y][x] = transposed1[x][y];
        }
    }
    
    // 处理 y
    for (let y = height - 1; y >= 0; y--) {
        const _y = yArr[y];
        [transposed2[y], transposed2[_y]] = [transposed2[_y], transposed2[y]];
    }
    
    // 转换回 ImageData
    const newData = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            newData[idx] = transposed2[y][x][0];
            newData[idx + 1] = transposed2[y][x][1];
            newData[idx + 2] = transposed2[y][x][2];
            newData[idx + 3] = transposed2[y][x][3];
        }
    }
    
    return new ImageData(newData, width, height);
}

/**
 * 解密图片 - 版本 3 (pixel_shuffle_3)
 * @param {ImageData} imageData Canvas ImageData 对象
 * @param {string} password 密码
 * @returns {ImageData}
 */
function decryptImageV3(imageData, password) {
    const width = imageData.width;
    const height = imageData.height;
    
    const xArr = Array.from({ length: width }, (_, i) => i);
    shuffleArrV2(xArr, password);
    
    const yArr = Array.from({ length: height }, (_, i) => i);
    shuffleArrV2(yArr, getSha256(password));
    
    // 转换为二维数组
    const pixels = [];
    for (let y = 0; y < height; y++) {
        pixels[y] = [];
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            pixels[y][x] = [
                imageData.data[idx],
                imageData.data[idx + 1],
                imageData.data[idx + 2],
                imageData.data[idx + 3]
            ];
        }
    }
    
    // 处理 y
    const tempPixels = pixels.map(row => [...row]);
    for (let y = 0; y < height; y++) {
        pixels[yArr[y]] = tempPixels[y];
    }
    
    // 转置
    const transposed = [];
    for (let x = 0; x < width; x++) {
        transposed[x] = [];
        for (let y = 0; y < height; y++) {
            transposed[x][y] = pixels[y][x];
        }
    }
    
    // 处理 x
    const tempTransposed = transposed.map(row => [...row]);
    for (let x = 0; x < width; x++) {
        transposed[xArr[x]] = tempTransposed[x];
    }
    
    // 转置回来
    const result = [];
    for (let y = 0; y < height; y++) {
        result[y] = [];
        for (let x = 0; x < width; x++) {
            result[y][x] = transposed[x][y];
        }
    }
    
    // 转换回 ImageData
    const newData = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            newData[idx] = result[y][x][0];
            newData[idx + 1] = result[y][x][1];
            newData[idx + 2] = result[y][x][2];
            newData[idx + 3] = result[y][x][3];
        }
    }
    
    return new ImageData(newData, width, height);
}

/**
 * 从 Base64 解密图片
 * @param {string} base64Data Base64 编码的图片数据
 * @param {string} password 密码（默认: 123qwe）
 * @param {string} encryptType 加密类型 ('pixel_shuffle', 'pixel_shuffle_2', 'pixel_shuffle_3')
 * @returns {Promise<string>} 返回解密后的 Base64 数据
 */
export async function decryptImageFromBase64(base64Data, password = '123qwe', encryptType = 'pixel_shuffle_2') {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // 对密码进行 SHA256 哈希
            const hashedPassword = getSha256(password);
            
            let decryptedImageData;
            
            // 根据加密类型选择解密方法
            switch (encryptType) {
                case 'pixel_shuffle':
                    decryptedImageData = decryptImageV1(imageData, hashedPassword);
                    break;
                case 'pixel_shuffle_2':
                    decryptedImageData = decryptImageV2(imageData, hashedPassword);
                    break;
                case 'pixel_shuffle_3':
                    decryptedImageData = decryptImageV3(imageData, hashedPassword);
                    break;
                default:
                    reject(new Error('Unknown encryption type: ' + encryptType));
                    return;
            }
            
            ctx.putImageData(decryptedImageData, 0, 0);
            
            // 转换为 Base64
            const decryptedBase64 = canvas.toDataURL('image/png');
            resolve(decryptedBase64);
        };
        
        img.onerror = (error) => {
            reject(new Error('Failed to load image: ' + error));
        };
        
        img.src = base64Data;
    });
}

/**
 * 检测并自动解密图片（从 PNG 元数据中读取加密类型）
 * @param {string} base64Data Base64 编码的图片数据
 * @param {string} password 密码（默认: 123qwe）
 * @returns {Promise<string>} 返回解密后的 Base64 数据
 */
export async function autoDecryptImage(base64Data, password = '123qwe') {
    // 注意：JavaScript 无法直接读取 PNG 的文本块元数据
    // 如果需要读取元数据，需要解析 PNG 文件结构
    // 这里假设使用默认的 pixel_shuffle_2
    return decryptImageFromBase64(base64Data, password, 'pixel_shuffle_2');
}

export { getSha256, shuffleArr, shuffleArrV2 };