import forge from "node-forge";

function md5 (buffer: any): any {
  return forge.md.md5.create().update(buffer.bytes()).digest();
}

export default function generateOrder (
  orderToEncrypt: number,
  key = ""
): string {
  if (!key) {
    key = new forge.util.ByteBuffer();
  }

  const cipher = forge.cipher.createCipher('AES-CBC', md5(key));
  const iv = new forge.util.ByteBuffer(Buffer.alloc(16));

  cipher.start({ iv });

  const data = forge.util.encodeUtf8('' + orderToEncrypt);
  
  cipher.update(new forge.util.ByteBuffer(data));
  return cipher.finish() && cipher.output.toHex();
}
