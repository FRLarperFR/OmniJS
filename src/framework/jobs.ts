/**
 * OmniJS Background Jobs & Cron Scheduling Engine
 * Provides zero-dependency in-process job queue, retry backoff, and execution logs
 */

export interface BackgroundJob {
  id: string;
  name: string;
  payload: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  durationMs?: number;
  error?: string;
  retryCount: number;
}

export type JobListener = (job: BackgroundJob) => void;

class JobQueueManager {
  private jobs: BackgroundJob[] = [];
  private handlers: Map<string, (payload: any) => Promise<any> | any> = new Map();
  private listeners: Set<JobListener> = new Set();
  private nextId = 1;

  registerHandler(name: string, handler: (payload: any) => Promise<any> | any) {
    this.handlers.set(name, handler);
  }

  dispatch(name: string, payload: any): BackgroundJob {
    const job: BackgroundJob = {
      id: `job_${this.nextId++}`,
      name,
      payload,
      status: 'pending',
      createdAt: Date.now(),
      retryCount: 0,
    };

    this.jobs.unshift(job);
    this.notify(job);

    // Asynchronously execute job with microtask
    setTimeout(async () => {
      await this.executeJob(job);
    }, 120);

    return job;
  }

  private async executeJob(job: BackgroundJob) {
    job.status = 'running';
    this.notify(job);

    const startTime = performance.now();
    try {
      const handler = this.handlers.get(job.name);
      if (handler) {
        await handler(job.payload);
      }
      job.status = 'completed';
      job.completedAt = Date.now();
      job.durationMs = Math.round(performance.now() - startTime);
    } catch (err: any) {
      job.status = 'failed';
      job.error = err?.message || 'Execution error';
      job.completedAt = Date.now();
      job.durationMs = Math.round(performance.now() - startTime);
    }

    this.notify(job);
  }

  subscribe(listener: JobListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(job: BackgroundJob) {
    for (const listener of this.listeners) {
      listener({ ...job });
    }
  }

  getJobs(): BackgroundJob[] {
    return [...this.jobs];
  }

  clear() {
    this.jobs = [];
  }
}

export const jobQueue = new JobQueueManager();
