import type { ApiClient } from "../client";
import type { operations } from "../generated/backend";

type AttemptResponse =
  operations["AttemptsController_startAttempt"]["responses"]["201"]["content"]["application/json"];

export type { AttemptResponse };

export function createLearningAssessmentsApi(client: ApiClient) {
  return {
    async startAttempt(
      guideId: string,
      assessmentId: string,
      signal?: AbortSignal,
    ): Promise<AttemptResponse> {
      return (await client.request({
        path: `/learning/guides/${guideId}/assessments/${assessmentId}/attempts`,
        method: "POST",
        body: {},
        signal,
        recoverAuth: true,
      })) as AttemptResponse;
    },
    async getAttempt(
      guideId: string,
      assessmentId: string,
      attemptId: string,
      signal?: AbortSignal,
    ): Promise<AttemptResponse> {
      return (await client.request({
        path: `/learning/guides/${guideId}/assessments/${assessmentId}/attempts/${attemptId}`,
        signal,
        recoverAuth: true,
      })) as AttemptResponse;
    },
    async saveAnswer(
      guideId: string,
      assessmentId: string,
      attemptId: string,
      body: {
        questionId: string;
        response: unknown;
        operationId: string;
      },
    ): Promise<AttemptResponse> {
      return (await client.request({
        path: `/learning/guides/${guideId}/assessments/${assessmentId}/attempts/${attemptId}/answers`,
        method: "PATCH",
        body,
        recoverAuth: true,
      })) as AttemptResponse;
    },
    async submitAttempt(
      guideId: string,
      assessmentId: string,
      attemptId: string,
      operationId: string,
    ): Promise<AttemptResponse> {
      return (await client.request({
        path: `/learning/guides/${guideId}/assessments/${assessmentId}/attempts/${attemptId}/submit`,
        method: "POST",
        body: { operationId },
        recoverAuth: true,
      })) as AttemptResponse;
    },
  };
}