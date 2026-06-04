/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subtitle {
  text: string;
  start: number;
  end: number;
}

export interface JobResult {
  video_url: string;
  title: string;
  best_start: string;
  best_end: string;
  explanation: string;
  captions: Subtitle[];
}

export interface JobStatusResponse {
  status: "processing" | "completed" | "failed";
  step: number;
  progress: number;
  error: string | null;
  result: JobResult | null;
}
