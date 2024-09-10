// Constants for buffer size and dimensions
const BUFFER_SIZE = 1000;
const DIMENSION = 10;
const TOTAL_ELEMENTS = 3; // Number of array outputs

async function init() {
  if (!navigator.gpu) {
    throw new Error('WebGPU not supported.');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('Couldn\'t request WebGPU adapter.');
  }

  const device = await adapter.requestDevice();

  // Shader code
  const shader = `
  @group(0) @binding(0) var<storage, read> inputA: array<f32>;
  @group(0) @binding(1) var<storage, read> inputB: array<f32>;
  @group(0) @binding(2) var<storage, read_write> output: array<f32>;

  @compute @workgroup_size(64)
  fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let flatIndex = global_id.x * ${DIMENSION}u;
    if (flatIndex >= ${TOTAL_ELEMENTS}u) {
      return;
    }

    for (var i: u32 = 0u; i < ${DIMENSION}u; i++) {
      if (flatIndex + i < ${TOTAL_ELEMENTS}u) {
        output[flatIndex + i] = inputA[flatIndex + i] + inputB[flatIndex + i];
      }
    }
  }
  `.replace('${DIMENSION}', DIMENSION.toString())
    .replace('${TOTAL_ELEMENTS}', TOTAL_ELEMENTS.toString());

  // Create shader module
  const shaderModule = device.createShaderModule({ code: shader });

  // Create buffers
  const bufferA = device.createBuffer({
    size: TOTAL_ELEMENTS * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });

  const bufferB = device.createBuffer({
    size: TOTAL_ELEMENTS * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });

  const output = device.createBuffer({
    size: TOTAL_ELEMENTS * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  const stagingBuffer = device.createBuffer({
    size: TOTAL_ELEMENTS * 4,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
  });

  // Hardcoded values for A and B
  const valuesA = [1, 2, 3];
  const valuesB = [2, 3, 4];
  const dataA = new Float32Array(TOTAL_ELEMENTS);
  const dataB = new Float32Array(TOTAL_ELEMENTS);
  for (let i = 0; i < TOTAL_ELEMENTS; i++) {
    dataA[i] = valuesA[i % valuesA.length];
    dataB[i] = valuesB[i % valuesB.length];
  }

  device.queue.writeBuffer(bufferA, 0, dataA.buffer);
  device.queue.writeBuffer(bufferB, 0, dataB.buffer);

  // Create bind group layout and bind group
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }
    ]
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: bufferA } },
      { binding: 1, resource: { buffer: bufferB } },
      { binding: 2, resource: { buffer: output } }
    ]
  });

  // Compute pipeline
  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    }),
    compute: {
      module: shaderModule,
      entryPoint: 'main'
    }
  });

  // Command encoder and dispatch work
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(BUFFER_SIZE);
  passEncoder.end();

  // Copy from output to staging buffer
  commandEncoder.copyBufferToBuffer(
    output,
    0,
    stagingBuffer,
    0,
    TOTAL_ELEMENTS * 4
  );

  // Submit commands
  const commands = commandEncoder.finish();
  device.queue.submit([commands]);

  // Read back the results
  await stagingBuffer.mapAsync(GPUMapMode.READ);
  const copyArrayBuffer = stagingBuffer.getMappedRange();
  console.log(new Float32Array(copyArrayBuffer));
  stagingBuffer.unmap();
}

init();
