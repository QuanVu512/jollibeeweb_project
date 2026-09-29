const { spawn, spawnSync } = require('node:child_process');
const { mkdtemp, rm, readFile } = require('node:fs/promises');
const { existsSync } = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { MongoClient } = require('mongoose').mongo;

function mongodBinary() {
  if (process.env.TEST_MONGOD) return process.env.TEST_MONGOD;
  if (process.platform === 'win32') {
    return ['8.3', '8.2', '8.0', '7.0'].map(version => `C:\\Program Files\\MongoDB\\Server\\${version}\\bin\\mongod.exe`).find(existsSync);
  }
  return spawnSync('mongod', ['--version'], { stdio: 'ignore', windowsHide: true }).status === 0 ? 'mongod' : null;
}

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function startLocalMongo() {
  const binary = mongodBinary();
  if (!binary) throw new Error('Cần mongod cục bộ. Cài MongoDB Server hoặc đặt TEST_MONGOD tới executable.');
  const tempRoot = path.resolve(os.tmpdir());
  const directory = await mkdtemp(path.join(tempRoot, 'kiosk-mongo-'));
  const port = await availablePort();
  const uri = `mongodb://127.0.0.1:${port}/?directConnection=true`;
  const logPath = path.join(directory, 'mongod.log');
  const child = spawn(binary, ['--bind_ip', '127.0.0.1', '--port', String(port), '--dbpath', directory,
    '--replSet', 'kioskLocal', '--logpath', logPath, '--quiet'], { stdio: 'ignore', windowsHide: true });
  let launchError;
  child.on('error', error => { launchError = error; });
  let closed = false;
  child.on('exit', () => { closed = true; });
  const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
  async function stop() {
    if (!closed) {
      child.kill();
      for (let count = 0; count < 100 && !closed; count += 1) await sleep(50);
      if (!closed && !launchError) throw new Error('mongod chưa dừng; giữ thư mục tạm để bảo toàn tiến trình.');
    }
    // Verify the resolved recursive cleanup target is exactly our mkdtemp child.
    const target = path.resolve(directory);
    if (path.dirname(target) !== tempRoot || !path.basename(target).startsWith('kiosk-mongo-')) throw new Error('Đường dẫn cleanup không hợp lệ.');
    await rm(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
  let client;
  try {
    for (let count = 0; ; count += 1) {
      if (launchError || closed || count >= 80) throw launchError || new Error('MongoDB cục bộ không khởi động được.');
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 250 });
      try { await client.connect(); break; }
      catch (_error) { await client.close(); await sleep(100); }
    }
    await client.db('admin').command({ replSetInitiate: { _id: 'kioskLocal', members: [{ _id: 0, host: `127.0.0.1:${port}` }] } });
    for (let count = 0; ; count += 1) {
      const hello = await client.db('admin').command({ hello: 1 });
      if (hello.isWritablePrimary) break;
      if (count >= 100) throw new Error('Replica set cục bộ chưa sẵn sàng.');
      await sleep(100);
    }
    await client.close();
    return { uri: `mongodb://127.0.0.1:${port}/?replicaSet=kioskLocal`, stop };
  } catch (error) {
    if (client) await client.close();
    const log = await readFile(logPath, 'utf8').catch(() => '');
    await stop();
    throw new Error(`${error.message}\n${log.slice(-1000)}`);
  }
}

module.exports = { mongodBinary, startLocalMongo };
