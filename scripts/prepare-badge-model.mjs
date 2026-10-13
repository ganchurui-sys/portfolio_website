import { readFile, writeFile } from "node:fs/promises";

// The badge supplies its own WebP artwork. The upstream GLB still contains a
// 2.3 MB PNG for an unused base material; keep every geometry byte unchanged.
const source = new URL("../public/react-bits-lanyard-card.glb", import.meta.url);
const destination = new URL("../public/zhong-lanyard-card-v2.glb", import.meta.url);
const input = await readFile(source);
const jsonLength = input.readUInt32LE(12);
const model = JSON.parse(input.subarray(20, 20 + jsonLength).toString());
const binStart = 20 + jsonLength + 8;
const imageView = model.images[0].bufferView;
if (model.images.length !== 1 || imageView !== model.bufferViews.length - 1) {
  throw new Error("The source model layout changed; inspect before stripping its image.");
}
const geometryLength = model.bufferViews[imageView].byteOffset;
const geometry = input.subarray(binStart, binStart + geometryLength);
delete model.materials.find(material => material.name === "base").pbrMetallicRoughness.baseColorTexture;
delete model.images;
delete model.textures;
delete model.samplers;
model.bufferViews.pop();
model.buffers[0].byteLength = geometry.length;
const json = Buffer.from(JSON.stringify(model));
const paddedJson = Buffer.alloc(Math.ceil(json.length / 4) * 4, 0x20);
json.copy(paddedJson);
const output = Buffer.alloc(12 + 8 + paddedJson.length + 8 + geometry.length);
output.writeUInt32LE(0x46546c67, 0);
output.writeUInt32LE(2, 4);
output.writeUInt32LE(output.length, 8);
output.writeUInt32LE(paddedJson.length, 12);
output.writeUInt32LE(0x4e4f534a, 16);
paddedJson.copy(output, 20);
const binHeader = 20 + paddedJson.length;
output.writeUInt32LE(geometry.length, binHeader);
output.writeUInt32LE(0x004e4942, binHeader + 4);
geometry.copy(output, binHeader + 8);
await writeFile(destination, output);
console.log(`Badge model: ${input.length} → ${output.length} bytes; geometry unchanged.`);
