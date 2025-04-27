import forge from 'node-forge'

const AES_KEY = import.meta.env.VITE_API_KEY

const encryptWithAESGCM = (data) => {
  try {
    // 1. Проверка входных данных
    if (!Array.isArray(data) || data.length !== 128) {
      throw new Error('Face descriptor должен быть массивом из 128 чисел')
    }

    // 2. Правильное преобразование строкового ключа в бинарный формат
    const keyStr = AES_KEY.padEnd(32, '0').slice(0, 32)
    const keyBytes = forge.util.createBuffer(keyStr, 'raw')

    // 3. Генерируем IV (12 байт для GCM)
    const iv = forge.random.getBytesSync(12)

    // 4. Создаем шифр
    const cipher = forge.cipher.createCipher('AES-GCM', keyBytes)
    cipher.start({
      iv,
      tagLength: 128, // 16-байтный тег аутентификации
    })

    // 5. Шифруем данные
    cipher.update(forge.util.createBuffer(JSON.stringify(data)))
    cipher.finish()

    // 6. Возвращаем результат
    return {
      ciphertext: forge.util.encode64(cipher.output.getBytes()),
      iv: forge.util.encode64(iv),
      tag: forge.util.encode64(cipher.mode.tag.getBytes()),
    }
  } catch (error) {
    throw new Error(`Ошибка шифрования: ${error.message}`)
  }
}

export default encryptWithAESGCM
