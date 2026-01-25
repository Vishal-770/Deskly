export interface CurriculumAPI {
  get: (
    cookies: string,
    authorizedID: string,
    csrf: string,
  ) => Promise<{
    success: boolean;
    html?: string;
    error?: string;
  }>;
}
