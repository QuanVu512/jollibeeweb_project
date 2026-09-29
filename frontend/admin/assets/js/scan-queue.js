(function expose(root) {
  class ScanQueue {
    constructor(worker, onChange = () => {}, onError = () => {}) {
      this.worker = worker; this.onChange = onChange; this.onError = onError;
      this.items = []; this.pending = new Set(); this.running = false; this.stopped = false;
    }
    enqueue(code) {
      const normalized = code.trim().toUpperCase();
      if (!normalized || this.stopped || this.pending.has(normalized) || this.pending.size >= 100) return false;
      this.pending.add(normalized); this.items.push(normalized); this.onChange(this.pending.size);
      this.drain(); return true;
    }
    stop() { this.stopped = true; this.items = []; this.pending.clear(); this.onChange(0); }
    async drain() {
      if (this.running) return;
      this.running = true;
      while (this.items.length && !this.stopped) {
        const code = this.items.shift();
        try { await this.worker(code); } catch (error) { this.onError(error); }
        finally { this.pending.delete(code); this.onChange(this.pending.size); }
      }
      this.running = false;
    }
  }
  if (typeof module === 'object' && module.exports) module.exports = ScanQueue;
  else root.ScanQueue = ScanQueue;
})(typeof window === 'object' ? window : globalThis);
